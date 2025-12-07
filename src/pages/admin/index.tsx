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
          <div className="md:hidden">
            {bookingRequests.map((request) => (
              <div
                key={request.id}
                className="border-b border-gray-200 p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-lg">
                    {request.customer?.name || 'N/A'}
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {request.status}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {request.start_date} to {request.end_date}
                </div>
                <div className="text-sm mb-2">Sitter: {request.sitter?.user?.email || 'N/A'}</div>
                <div className="text-sm mb-2">
                  Notified Sitters:
                  {request.booking_sitter_recipients.map(recipient => (
                    <div key={recipient.sitter.user.first_name}>
                      - {recipient.sitter.user.first_name} {recipient.sitter.user.last_name}: {recipient.status}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">${request.total_cost_cents / 100}</div>
                  <div className={`text-sm font-semibold ${request.payment_status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                    {request.payment_status}
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/admin/bookings/${request.id}`}
                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
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
