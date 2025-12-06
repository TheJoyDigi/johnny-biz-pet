import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import AdminLayout from './_layout';

interface Sitter {
  id: string;
  address: string;
  base_rate_cents: number;
  is_active: boolean;
  user: {
    id: string;
    email: string;
  };
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

  const { data: userDetails } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userDetails?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const { data: sitters } = await supabase.from('sitters').select(`
      id,
      address,
      base_rate_cents,
      is_active,
      user:users (
        id,
        email
      )
    `);

  return {
    props: { sitters: sitters || [] },
  };
};

function SittersPage({ sitters }: { sitters: Sitter[] }) {
  const handleDelete = async (userId: string) => {
    const adminPassword = window.prompt(
      'Please enter your admin password to confirm.'
    );
    if (adminPassword) {
      const response = await fetch('/api/admin/delete-sitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, adminPassword }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert(`Failed to delete sitter: ${data.message}`);
      }
    }
  };
  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-4 md:mb-8">
          <h1 className="text-3xl font-bold">Sitter Management</h1>
          <Link
            href="/admin/sitters/new"
            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Create Sitter
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Address
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Base Rate
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Active
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sitters.map((sitter) => (
                  <tr key={sitter.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitter.user ? sitter.user.email : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitter.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitter.base_rate_cents / 100}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitter.is_active ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-4">
                      <Link
                        href={`/admin/sitters/${sitter.user.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(sitter.user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile card view */}
          <div className="md:hidden">
            {sitters.map((sitter) => (
              <div
                key={sitter.id}
                className="border-b border-gray-200 p-4"
              >
                <div className="flex justify-between">
                  <div className="font-bold">
                    {sitter.user ? sitter.user.email : 'N/A'}
                  </div>
                  <div>{sitter.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <div>Address: {sitter.address || 'N/A'}</div>
                <div>Base Rate: ${sitter.base_rate_cents / 100}</div>
                <div className="mt-2 space-x-4">
                  <Link
                    href={`/admin/sitters/${sitter.user.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(sitter.user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default SittersPage;
