import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import AdminLayout from './_layout';

interface Sitter {
  id: string;
  address: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
  contact_email: string | null;
  sitter_primary_services: {
    price_cents: number;
    service_types: {
      slug: string;
    }
  }[];
  user: {
    id: string;
    email: string;
  } | null;
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
      is_active,
      first_name,
      last_name,
      contact_email,
      sitter_primary_services (
        price_cents,
        service_types (slug)
      ),
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
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingSitterId, setInvitingSitterId] = useState<string | null>(null);
  
  const handleDelete = async (sitter: Sitter) => {
    // ... code truncated ...
    const adminPassword = window.prompt(
      'Please enter your admin password to confirm.'
    );
    if (adminPassword) {
      const payload: any = { adminPassword };
      if (sitter.user?.id) {
          payload.user_id = sitter.user.id;
      } else {
          payload.sitter_id = sitter.id;
      }

      const response = await fetch('/api/admin/delete-sitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert(`Failed to delete sitter: ${data.message}`);
      }
    }
  };

  const handleInvite = async (sitter: Sitter) => {
      const email = prompt('Enter email to invite:', sitter.contact_email || '');
      if(!email) return;
      
      try {
          const res = await fetch('/api/admin/invite-existing-sitter', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  sitterId: sitter.id,
                  email: email,
                  firstName: sitter.first_name || 'Sitter',
                  lastName: sitter.last_name || 'User'
              })
          });
          const data = await res.json();
          if(res.ok) {
              alert(data.message);
              window.location.reload();
          } else {
              alert('Error: ' + data.message);
          }
      } catch(e: any) {
          alert('Error: ' + e.message);
      }
  };

  const getSitterPrice = (sitter: Sitter) => {
      const boarding = sitter.sitter_primary_services?.find(s => s.service_types?.slug === 'dog-boarding');
      return boarding ? boarding.price_cents / 100 : 0;
  };

  const getSitterName = (sitter: Sitter) => {
      if(sitter.user?.email) return sitter.user.email;
      if(sitter.first_name || sitter.last_name) return `${sitter.first_name || ''} ${sitter.last_name || ''}`.trim() + ' (No Account)';
      return sitter.contact_email || 'Unnamed';
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
                    Name / Email
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
                      {getSitterName(sitter)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitter.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSitterPrice(sitter)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sitter.is_active ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-4">
                        <Link
                            href={`/admin/sitters/${sitter.user?.id || sitter.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => handleDelete(sitter)}
                            className="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                        {!sitter.user && (
                            <button
                                onClick={() => handleInvite(sitter)}
                                className="text-green-600 hover:text-green-900 font-medium"
                            >
                                Invite User
                            </button>
                        )}
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
                    {getSitterName(sitter)}
                  </div>
                  <div>{sitter.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <div>Address: {sitter.address || 'N/A'}</div>
                <div>Base Rate: ${getSitterPrice(sitter)}</div>
                <div className="mt-2 flex items-center space-x-4">
                  <Link
                    href={`/admin/sitters/${sitter.user?.id || sitter.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(sitter)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                  {!sitter.user && (
                      <button
                        onClick={() => handleInvite(sitter)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Invite User
                      </button>
                  )}
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
