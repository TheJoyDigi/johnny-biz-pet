import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import SitterLayout from './_layout';
import { type BookingRequest } from '@/core/types';
import BookingCalendar from '@/components/sitter/BookingCalendar';
import { Check, X, CalendarCheck, Clock, User as UserIcon } from 'lucide-react';

export default function SitterDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [activeTab, setActiveTab] = useState('new-requests');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserAndBookings = useCallback(async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          router.push('/sitter/login');
          return;
      }
      setUser(user);

      if (user) {
        const { data: sitter, error: sitterError } = await supabase
          .from('sitters')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (sitterError || !sitter) {
          console.error('Error fetching sitter:', sitterError);
          setIsLoading(false);
          return;
        }

        // 1. Fetch Assigned Bookings
        const { data: assignedBookings, error: assignedError } = await supabase
          .from('booking_requests')
          .select('*, customers(name, email)') 
          .eq('assigned_sitter_id', sitter.id);

        // 2. Fetch Pending Requests (where I am a recipient and status is still PENDING_SITTER_ACCEPTANCE globally)
        const { data: recipientRows, error: recipientError } = await supabase
          .from('booking_sitter_recipients')
          .select('booking_request_id, status')
          .eq('sitter_id', sitter.id)
          .eq('status', 'PENDING'); 

        let pendingRequests: any[] = [];
        if (recipientRows && recipientRows.length > 0) {
             const ids = recipientRows.map(r => r.booking_request_id);
             const { data: pr } = await supabase
                .from('booking_requests')
                .select('*, customers(name, email)')
                .in('id', ids)
                .eq('status', 'PENDING_SITTER_ACCEPTANCE');
             if(pr) pendingRequests = pr;
        }

        if (assignedError) {
          console.error('Error fetching bookings:', assignedError);
        } else {
          const allBookings = [...(assignedBookings || []), ...pendingRequests];
          const uniqueBookings = Array.from(new Map(allBookings.map(item => [item.id, item])).values());
          // @ts-ignore
          setBookings(uniqueBookings);
        }
      }
      setIsLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchUserAndBookings();
  }, [fetchUserAndBookings]);

  const handleAccept = async (bookingId: string) => {
      if(!confirm("Are you sure you want to accept this booking request?")) return;
      try {
          const res = await fetch('/api/sitter/accept-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId })
          });
          if(!res.ok) throw new Error((await res.json()).message);
          fetchUserAndBookings();
      } catch (e: any) { alert(e.message); }
  };

  const handleDecline = async (bookingId: string) => {
      if(!confirm("Are you sure you want to decline this booking?")) return;
      try {
          const res = await fetch('/api/sitter/decline-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId })
          });
          if(!res.ok) throw new Error((await res.json()).message);
          fetchUserAndBookings();
      } catch (e: any) { alert(e.message); }
  };

  const handleFinalize = async (bookingId: string) => {
       if(!confirm("Confirm that you have scheduled with the client and are ready to finalize booking?")) return;
       try {
          const res = await fetch('/api/sitter/finalize-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId })
          });
          if(!res.ok) throw new Error((await res.json()).message);
          fetchUserAndBookings();
      } catch (e: any) { alert(e.message); }
  };

  const newRequests = bookings.filter(b => b.status === 'PENDING_SITTER_ACCEPTANCE');
  const activeBookings = bookings.filter(b => b.status === 'ACCEPTED' && b.payment_status === 'UNPAID'); 
  const calendarBookings = bookings.filter(b => (b.status === 'ACCEPTED' && b.payment_status === 'PAID') || b.status === 'COMPLETED');

  if (isLoading) return <SitterLayout><div className="p-8 text-center text-gray-500">Loading dashboard...</div></SitterLayout>;

  return (
    <SitterLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Sitter Dashboard</h1>
        
        {/* Mobile Tabs */}
        <div className="sm:hidden mb-6">
          <select
            className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md py-2 px-3 bg-white shadow-sm"
            onChange={(e) => setActiveTab(e.target.value)}
            value={activeTab}
          >
            <option value="new-requests">New Requests ({newRequests.length})</option>
            <option value="pending-bookings">Meet & Greet ({activeBookings.length})</option>
            <option value="calendar">Calendar</option>
          </select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex border-b border-gray-200 mb-6 space-x-8">
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'new-requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('new-requests')}
          >
            New Requests ({newRequests.length})
          </button>
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pending-bookings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('pending-bookings')}
          >
            Meet & Greet / Scheduling ({activeBookings.length})
          </button>
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'calendar' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('calendar')}
          >
            Booked Calendar
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'new-requests' && (
            <div className="space-y-4">
              {newRequests.length === 0 && <p className="text-gray-500 text-center py-10">No new booking requests.</p>}
              {newRequests.map(booking => (
                <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">New Request</span>
                                <span className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.customers?.name || 'Unknown User'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><CalendarCheck className="w-4 h-4"/> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                                {/* <span className="flex items-center gap-1"><UserIcon className="w-4 h-4"/> 1 Pet</span> */}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => router.push(`/sitter/bookings/${booking.id}`)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                View Details
                            </button>
                            <button onClick={() => handleDecline(booking.id)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2">
                                <X className="w-4 h-4" /> Decline
                            </button>
                            <button onClick={() => handleAccept(booking.id)} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                                <Check className="w-4 h-4" /> Accept
                            </button>
                        </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pending-bookings' && (
            <div className="space-y-4">
              {activeBookings.length === 0 && <p className="text-gray-500 text-center py-10">No pending bookings to schedule.</p>}
              {activeBookings.map(booking => (
                <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">Accepted - Scheduling</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.customers?.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">Contact: {booking.customers?.email || 'N/A'}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><CalendarCheck className="w-4 h-4"/> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                         <div className="flex gap-3 items-center">
                            <div className="text-right mr-4 hidden md:block">
                                <p className="text-xs text-gray-500">Coordinate Meet & Greet</p>
                                <p className="text-xs text-gray-500">Then finalize below</p>
                            </div>
                            <button onClick={() => router.push(`/sitter/bookings/${booking.id}`)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                Details
                            </button>
                            <button onClick={() => handleFinalize(booking.id)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-2">
                                <Check className="w-4 h-4" /> Mark Booked
                            </button>
                        </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'calendar' && (
             <BookingCalendar bookings={calendarBookings} />
          )}
        </div>
      </div>
    </SitterLayout>
  );
}
