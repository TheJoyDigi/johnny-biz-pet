/**
 * @jest-environment node
 */
import { createMocks } from 'node-mocks-http';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import handler from '../../pages/api/booking';

// Mock nodemailer
jest.mock('nodemailer');
const sendMailMock = jest.fn();
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('/api/booking Integration Test', () => {
  const testEmail = `integration-test-${Date.now()}@example.com`;
  const testPetName = `TestPet-${Date.now()}`;
  let createdBookingId: string | null = null;
  let createdCustomerId: string | null = null;
  let createdPetId: string | null = null;

  afterAll(async () => {
    // Cleanup
    if (createdBookingId) {
      await supabase.from('booking_pets').delete().eq('booking_request_id', createdBookingId);
      await supabase.from('booking_addons').delete().eq('booking_request_id', createdBookingId);
      await supabase.from('booking_sitter_recipients').delete().eq('booking_request_id', createdBookingId);
      await supabase.from('booking_notes').delete().eq('booking_request_id', createdBookingId);
      await supabase.from('booking_requests').delete().eq('id', createdBookingId);
    }
    if (createdPetId) {
      await supabase.from('pets').delete().eq('id', createdPetId);
    }
    if (createdCustomerId) {
      await supabase.from('customers').delete().eq('id', createdCustomerId);
    }
  });

  it('should send emails with resolved names and persist data to Supabase', async () => {
    process.env.SKIP_BOOKING_EMAIL = 'false';
    // Fetch Johnny's UUID and Services/Addons for the test
    const { data: sitter } = await supabase
        .from('sitters')
        .select(`
            id,
            sitter_primary_services(id, service_types(slug, name)),
            sitter_addons(id, name)
        `)
        .eq('slug', 'johnny-irvine')
        .single();
    
    if (!sitter) {
        throw new Error('Test prerequisite failed: Johnny sitter not found in DB');
    }

    // @ts-ignore
    const service = sitter.sitter_primary_services.find(s => s.service_types.slug === 'dog-boarding');
    // @ts-ignore
    const addon = sitter.sitter_addons.find(a => a.name === 'Sniffari Walk');

    if (!service || !addon) {
        throw new Error('Test prerequisite failed: Service or Addon not found');
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        sitterId: sitter.id, // Use UUID
        sitterName: 'Johnny',
        locationName: 'Irvine',
        serviceId: service.id, // Use UUID to test resolution
        firstName: 'Integration',
        lastName: 'Tester',
        email: testEmail,
        phone: '555-0199',
        petName: testPetName,
        petType: 'dog',
        startDate: '2025-12-25',
        startTime: '09:00',
        endDate: '2025-12-27', // 2 nights
        endTime: '17:00',
        addons: {
          [addon.id]: 1, // Use UUID key
        },
        notes: 'Integration test note',
        referralSource: 'Google',
      },
    });

    await handler(req, res);

    // 1. Verify Response
    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);

    // 2. Verify Email
    expect(sendMailMock).toHaveBeenCalledTimes(2);
    const businessEmailCall = sendMailMock.mock.calls[0][0];
    const customerEmailCall = sendMailMock.mock.calls[1][0];

    expect(businessEmailCall.to).toContain('hello@ruhrohretreat.com'); 
    expect(businessEmailCall.html).toContain('Integration Tester');
    
    // Verify Service Name Resolution (Should NOT be UUID)
    expect(businessEmailCall.html).toContain('Service:</strong> Dog Boarding'); 
    expect(businessEmailCall.html).not.toContain(`Service:</strong> ${service.id}`);

    // Verify Addon Name Resolution
    expect(businessEmailCall.html).toContain('Sniffari Walk (x1)');
    expect(businessEmailCall.html).toContain('Integration test note');

    expect(customerEmailCall.to).toBe(testEmail);
    expect(customerEmailCall.subject).toBe('Booking Request Confirmation');

    // 3. Verify Database
    // Check Customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, name')
      .eq('email', testEmail)
      .single();
    
    expect(customer).toBeDefined();
    expect(customer?.name).toBe('Integration Tester');
    createdCustomerId = customer?.id;

    // Check Pet
    const { data: pet } = await supabase
      .from('pets')
      .select('id, name, breed')
      .eq('customer_id', createdCustomerId)
      .eq('name', testPetName)
      .single();
    
    expect(pet).toBeDefined();
    expect(pet?.breed).toBe('dog');
    createdPetId = pet?.id;

    // Check Booking Request
    const { data: booking } = await supabase
      .from('booking_requests')
      .select('id, status, start_date, end_date')
      .eq('customer_id', createdCustomerId)
      .single();

    expect(booking).toBeDefined();
    expect(booking?.status).toBe('PENDING_SITTER_ACCEPTANCE');
    expect(booking?.start_date).toBe('2025-12-25');
    createdBookingId = booking?.id;

    // Check Sitter Recipient
    const { data: recipient } = await supabase
      .from('booking_sitter_recipients')
      .select('status')
      .eq('booking_request_id', createdBookingId)
      .single();
    expect(recipient?.status).toBe('NOTIFIED');

    // Check Addons
    const { data: savedAddons } = await supabase
        .from('booking_addons')
        .select('*, sitter_addons(name)')
        .eq('booking_request_id', createdBookingId);
    
    expect(savedAddons).toHaveLength(1);
    // @ts-ignore
    expect(savedAddons[0].sitter_addons.name).toBe('Sniffari Walk');

    // Check Notes
    const { data: savedNotes } = await supabase
        .from('booking_notes')
        .select('note')
        .eq('booking_request_id', createdBookingId)
        .single();
    expect(savedNotes?.note).toBe('Integration test note');
  });

  it('should NOT send emails when SKIP_BOOKING_EMAIL is true', async () => {
       // Backup env
       const oldEnv = process.env.SKIP_BOOKING_EMAIL;
       process.env.SKIP_BOOKING_EMAIL = 'true';
       sendMailMock.mockClear();

       // Reuse setup slightly simplified
       const { req, res } = createMocks({
        method: 'POST',
        body: {
          sitterId: 'afe64603-3fc6-42b0-a36b-aebb10092f54', // Random dummy or valid UUID doesn't matter much for email check, but needs to pass validation
          sitterName: 'Mock',
          locationName: 'City',
          serviceId: 'some-uuid',
          firstName: 'NoEmail',
          lastName: 'User',
          email: 'noemail@example.com',
          phone: '1234567890',
          petName: 'SilentPet',
          petType: 'dog',
          startDate: '2025-12-25',
          endDate: '2025-12-26',
        },
      });

      // Mock DB lookups to avoid failure before email step
      // Ideally we should mock supabase but we are using real integration logic with real DB.
      // So we need valid IDs or it will throw "Sitter not found".
      // Let's use the same fetch logic or just assume the previous test data is okay.
      // Actually, we can just skip the DB writes if we mocked the handler, but we haven't mocked the handler.
      // We are calling the real handler. So we need valid inputs.
      
      // Let's use the same inputs as above but different email to avoid unique constraint if any (customer email is unique key usually)
      
       const { data: sitter } = await supabase
        .from('sitters')
        .select('id, sitter_primary_services(id, service_types(slug))')
        .eq('slug', 'johnny-irvine')
        .single();
        
       // @ts-ignore
       const service = sitter.sitter_primary_services[0];
       
       const { req: req2, res: res2 } = createMocks({
         method: 'POST',
         body: {
           sitterId: sitter?.id,
           sitterName: 'Johnny',
           locationName: 'Irvine',
           serviceId: service.id,
           firstName: 'Skip',
           lastName: 'Email',
           email: `skip-${Date.now()}@example.com`,
           phone: '555-5555',
           petName: 'SkipPet',
           petType: 'dog',
           startDate: '2025-12-25',
           endDate: '2025-12-26',
         }
       });

       await handler(req2, res2);
       
       expect(res2._getStatusCode()).toBe(200);
       expect(sendMailMock).not.toHaveBeenCalled();

       // Cleanup env
       process.env.SKIP_BOOKING_EMAIL = oldEnv;
  });
});
