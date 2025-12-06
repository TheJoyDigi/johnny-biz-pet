import { useState } from 'react';
import { useRouter } from 'next/router';
import { type GetServerSideProps } from 'next';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import AdminLayout from '../../_layout';
import SitterForm from '@/components/admin/SitterForm';

// Define a more complete Sitter type for the page props
interface SitterProfile {
  id: string; // user id
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
    sitter_profile: {
    id: string;
    slug: string | null;
    tagline: string | null;
    avatar_url: string | null;
    hero_image_url: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    county: string | null;
    is_active: boolean | null;
    bio: any[] | null;
    skills: any[] | null;
    home_environment: any[] | null;
    care_style: any[] | null;
    parent_expectations: any[] | null;
    sitter_addons: any[];
    sitter_primary_services: any[];
    sitter_discounts: any[];
  } | null;
}

interface EditSitterPageProps {
    sitter: SitterProfile;
    serviceTypes: any[];
}

export const getServerSideProps: GetServerSideProps<EditSitterPageProps> = async (context) => {
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  const { data: adminUser } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (adminUser?.role !== 'ADMIN') {
    return { redirect: { destination: '/', permanent: false } };
  }

  const { id } = context.params || {};
  if (typeof id !== 'string') {
    return { notFound: true };
  }

  // Fetch Service Types
  const { data: serviceTypes } = await supabase.from('service_types').select('*').order('name');

  // Correctly fetch user and their related sitter profile with all relations
  const { data: sitter, error } = await supabase
    .from('users')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      sitter_profile:sitters!user_id (
        *,
        sitter_addons(*),
        sitter_discounts(*),
        sitter_primary_services(
            price_cents,
            service_types(*)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !sitter) {
    console.error('Error fetching sitter:', error);
    return { notFound: true };
  }

  // Safely handle the sitter_profile which can be an array
  const sitterProfile = Array.isArray(sitter.sitter_profile) && sitter.sitter_profile.length > 0
    ? sitter.sitter_profile[0]
    : sitter.sitter_profile;

  const finalSitter: SitterProfile = {
    ...sitter,
    sitter_profile: Array.isArray(sitterProfile) ? sitterProfile[0] : sitterProfile,
  };

  return { props: { sitter: finalSitter, serviceTypes: serviceTypes || [] } };
};

export default function EditSitterPage({ sitter, serviceTypes }: EditSitterPageProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
        const response = await fetch('/api/admin/update-sitter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: sitter.id, ...formData }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setSuccess('Sitter profile updated successfully!');
        router.replace(router.asPath);

    } catch (err: any) {
        setError(err.message);
        window.scrollTo(0, 0);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Sitter Profile</h1>
                <p className="text-gray-600">Managing profile for <span className="font-medium">{sitter.email}</span></p>
            </div>

            {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {success}
                </div>
            )}

            <SitterForm sitter={sitter} serviceTypes={serviceTypes} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </AdminLayout>
  );
}
