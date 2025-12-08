import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import SitterLayout from './_layout';
import SitterForm from '@/components/admin/SitterForm';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [sitterData, setSitterData] = useState<any>(null);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/sitter/login');
                return;
            }
            setUser(user);

            // Fetch Sitter
            const { data: sitter, error } = await supabase
                .from('sitters')
                .select(`
                    *,
                    sitter_primary_services(
                        price_cents,
                        service_types:service_types(id, name, slug, description)
                    ),
                    sitter_addons(*),
                    sitter_discounts(*),
                    users:user_id(first_name, last_name, phone_number)
                `)
                .eq('user_id', user.id)
                .single();
             
             if (sitter) {
                 const formattedSitter = {
                     id: sitter.id,
                     user_id: sitter.user_id,
                     first_name: sitter.users?.first_name || '',
                     last_name: sitter.users?.last_name || '',
                     email: user.email || '',
                     phone_number: sitter.users?.phone_number || '',
                     sitter_profile: sitter // The record itself is used as the profile object in SitterForm
                 };
                 setSitterData(formattedSitter);
             }

             // Fetch Service Types
             const { data: st } = await supabase.from('service_types').select('*');
             if(st) setServiceTypes(st);
        };
        fetchData();
    }, [supabase, router]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
             const payload = {
                 ...data,
                 userId: user?.id,
                 sitterId: sitterData?.id
             };

             const res = await fetch('/api/sitter/update-profile', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(payload)
             });
             
             if (!res.ok) {
                 const err = await res.json();
                 throw new Error(err.message);
             }
             alert('Profile updated successfully!');
             window.location.reload();
        } catch (e: any) {
            console.error(e);
            alert('Failed to update profile: ' + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!sitterData) return <SitterLayout><div className="p-8 text-center text-gray-500">Loading profile...</div></SitterLayout>;

    return (
        <SitterLayout>
            <div className="container mx-auto p-4 md:p-8">
                 <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h1>
                 <SitterForm 
                    sitter={sitterData}
                    serviceTypes={serviceTypes}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    endpoints={{
                        gallery: '/api/sitter/gallery',
                        update: '/api/sitter/update-profile'
                    }}
                 />
            </div>
        </SitterLayout>
    );
}
