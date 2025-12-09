import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import AdminLayout from './_layout';
import { createClient, User } from '@supabase/supabase-js';

interface BookingRequest {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_cost_cents: number;
  platform_fee_cents: number;
  sitter_payout_cents: number;
  payment_status: string;
  customer: {
    name: string;
  } | null;
  sitter: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  } | null;
  booking_sitter_recipients: {
    status: string;
    sitter: {
      user: {
        first_name: string;
        last_name: string;
      };
    };
  }[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name]
        },
        set(name: string, value: string, options: CookieOptions) {
        },
        remove(name: string, options: CookieOptions) {
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  // Use a dedicated admin client for data fetching to ensure RLS is bypassed and session doesn't interfere
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: bookingRequests, error } = await adminSupabase
    .from('booking_requests')
    .select(
      `
      id,
      start_date,
      end_date,
      status,
      total_cost_cents,
      platform_fee_cents,
      sitter_payout_cents,
      payment_status,
      customer:customers (
        name
      ),
      sitter:sitters!booking_requests_assigned_sitter_id_fkey (
        user:users (
          first_name,
          last_name,
          email
        )
      ),
      booking_sitter_recipients (
        status,
        sitter:sitters (
          user:users (
            first_name,
            last_name
          )
        )
      )
    `
    );
    
  if (error) {
    console.error('Error fetching booking requests:', error);
  }

  return {
    props: { user, bookingRequests: bookingRequests || [] },
  };
};

function AdminDashboard({ user, bookingRequests }: { user: User; bookingRequests: BookingRequest[] }) {
  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-8">Admin Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 md:mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Total Bookings</h2>
            <p className="text-2xl font-bold">{bookingRequests.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Revenue</h2>
            <p className="text-2xl font-bold">
              $
              {bookingRequests.reduce(
                (acc, req) => acc + req.total_cost_cents,
                0
              ) / 100}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">New Sitters</h2>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Booking Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4">
            <h2 className="text-xl font-bold">Booking Requests</h2>
          </div>
          <div className="hidden md:block">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Sitter
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Payout
                  </th>
                   <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Notified Sitters
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookingRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.sitter?.user?.first_name} {request.sitter?.user?.last_name}
                      <br />
                      {request.sitter?.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.start_date} to {request.end_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                        request.status === 'PENDING_SITTER_ACCEPTANCE' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${(request.total_cost_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      ${((request.platform_fee_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      ${((request.sitter_payout_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.payment_status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.booking_sitter_recipients.map(recipient => (
                        <div key={recipient.sitter.user.first_name}>
                          {recipient.sitter.user.first_name}: {recipient.status}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-4">
                      <Link
                        href={`/admin/bookings/${request.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-4">
            {bookingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-lg text-gray-900">
                    {request.customer?.name || 'N/A'}
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                    request.status === 'PENDING_SITTER_ACCEPTANCE' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                   <span className="font-medium bg-gray-50 px-2 py-1 rounded">
                      {request.start_date}
                   </span>
                   <span className="text-gray-400">to</span>
                   <span className="font-medium bg-gray-50 px-2 py-1 rounded">
                      {request.end_date}
                   </span>
                </div>
                <div className="text-sm mb-3 text-gray-700">
                    <span className="font-medium">Sitter:</span> {request.sitter?.user?.email || 'N/A'}
                </div>
                <div className="text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notified Sitters</span>
                  <div className="mt-2 space-y-1">
                    {request.booking_sitter_recipients.map(recipient => (
                        <div key={recipient.sitter.user.first_name} className="flex justify-between text-sm">
                        <span>{recipient.sitter.user.first_name} {recipient.sitter.user.last_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${recipient.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{recipient.status}</span>
                        </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="text-xl font-bold text-gray-900">${request.total_cost_cents / 100}</div>
                  <div className={`text-sm font-semibold px-2 py-1 rounded ${request.payment_status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {request.payment_status}
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/admin/bookings/${request.id}`}
                    className="block w-full text-center px-4 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
