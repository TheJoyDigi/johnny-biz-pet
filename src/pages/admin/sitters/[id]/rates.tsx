import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import AdminLayout from '../../_layout';

interface Sitter {
  id: string;
  county: string;
  is_active: boolean;
  user: {
    email: string;
  };
}

interface Addon {
  id: string;
  sitter_id: string;
  name: string;
  price_cents: number;
  description: string;
  created_at: string;
}

interface Discount {
  id: string;
  sitter_id: string;
  min_days: number;
  percentage: number;
  created_at: string;
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

  const { id } = context.params || {};
  if (typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  const { data: sitter } = await supabase
    .from('sitters')
    .select(`
      id,
      county,
      is_active,
      user:users (
        email
      )
    `)
    .eq('id', id)
    .single();

  const { data: addons } = await supabase
    .from('sitter_addons')
    .select('*')
    .eq('sitter_id', id);

  const { data: discounts } = await supabase
    .from('sitter_discounts')
    .select('*')
    .eq('sitter_id', id);

  return {
    props: { sitter, addons: addons || [], discounts: discounts || [] },
  };
};

function SitterRatesPage({ sitter, addons, discounts }: { sitter: Sitter; addons: Addon[]; discounts: Discount[] }) {
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonDescription, setAddonDescription] = useState('');
  const [discountMinDays, setDiscountMinDays] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error: addonError } = await supabase.from('sitter_addons').insert({
      sitter_id: sitter.id,
      name: addonName,
      price_cents: parseInt(addonPrice) * 100,
      description: addonDescription,
    });

    if (addonError) {
      setError(addonError.message);
    } else {
      setAddonName('');
      setAddonPrice('');
      setAddonDescription('');
      router.replace(router.asPath); // Refresh the page to show the new addon
    }
    setIsSubmitting(false);
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error: discountError } = await supabase.from('sitter_discounts').insert({
      sitter_id: sitter.id,
      min_days: parseInt(discountMinDays),
      percentage: parseInt(discountPercentage),
    });

    if (discountError) {
      setError(discountError.message);
    } else {
      setDiscountMinDays('');
      setDiscountPercentage('');
      router.replace(router.asPath); // Refresh the page to show the new discount
    }
    setIsSubmitting(false);
  };

  if (!sitter) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Manage Rates for {sitter.user.email}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-bold mb-4">Add-ons</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {addons.map((addon) => (
                      <tr key={addon.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{addon.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${addon.price_cents / 100}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{addon.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-4">
                          <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Create New Add-on</h3>
              <form onSubmit={handleCreateAddon} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="addonName" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="addonName"
                        id="addonName"
                        required
                        value={addonName}
                        onChange={(e) => setAddonName(e.target.value)}
                        className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="addonPrice" className="block text-sm font-medium text-gray-700">
                      Price (in dollars)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="addonPrice"
                        id="addonPrice"
                        required
                        value={addonPrice}
                        onChange={(e) => setAddonPrice(e.target.value)}
                        className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="addonDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="addonDescription"
                      id="addonDescription"
                      rows={3}
                      value={addonDescription}
                      onChange={(e) => setAddonDescription(e.target.value)}
                      className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                    ></textarea>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center w-full px-4 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Add-on'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow mt-8">
              <h2 className="text-xl font-bold mb-4">Discounts</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Minimum Days</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Percentage</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {discounts.map((discount) => (
                      <tr key={discount.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{discount.min_days}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{discount.percentage}%</td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-4">
                          <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow mt-8">
              <h3 className="text-xl font-bold mb-4">Create New Discount</h3>
              <form onSubmit={handleCreateDiscount} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="discountMinDays" className="block text-sm font-medium text-gray-700">
                      Minimum Days
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="discountMinDays"
                        id="discountMinDays"
                        required
                        value={discountMinDays}
                        onChange={(e) => setDiscountMinDays(e.target.value)}
                        className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">
                      Percentage
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="discountPercentage"
                        id="discountPercentage"
                        required
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        className="block w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center w-full px-4 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Discount'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default SitterRatesPage;
