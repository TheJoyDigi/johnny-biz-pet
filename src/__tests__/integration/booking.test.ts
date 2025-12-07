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

  it('should send emails and persist data to Supabase', async () => {
    // Fetch Johnny's UUID for the test
    const { data: sitter } = await supabase
        .from('sitters')
        .select('id')
        .eq('slug', 'johnny-irvine')
        .single();
    
    if (!sitter) {
        throw new Error('Test prerequisite failed: Johnny sitter not found in DB');
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        sitterId: sitter.id, // Use UUID
        sitterName: 'Johnny',
        locationName: 'Irvine',
        serviceId: 'Dog Boarding',
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
          'Sniffari Walk': 1, // Johnny has this addon
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

    expect(businessEmailCall.to).toContain('hello@ruhrohretreat.com'); // Or whatever env var is set
    expect(businessEmailCall.html).toContain('Integration Tester');
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
});
