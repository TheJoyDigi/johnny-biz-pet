import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, MapPin, DollarSign, Shield, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';

// Zod Schema
const sitterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  tagline: z.string().optional(),
  address: z.string().optional(),
  county: z.string().optional(),
  baseRate: z.number().min(0),
  bio: z.array(z.object({ text: z.string() })),
  skills: z.array(z.object({ text: z.string() })),
  homeEnvironment: z.array(z.object({ text: z.string() })),
  addons: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    price: z.number().min(0),
    description: z.string().optional()
  })),
  discounts: z.array(z.object({
    id: z.string().optional(),
    minDays: z.number().min(1),
    percentage: z.number().min(0).max(100)
  })),
});

type SitterFormValues = z.infer<typeof sitterSchema>;

interface SitterProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone_number: string | null;
    sitter_profile: any; 
}

interface SitterFormProps {
    sitter: SitterProfile;
    onSubmit: (data: SitterFormValues) => Promise<void>;
    isSubmitting: boolean;
}

export default function SitterForm({ sitter, onSubmit, isSubmitting }: SitterFormProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [galleryImages, setGalleryImages] = useState<{name: string, url: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize default values
    const sp = sitter.sitter_profile || {};
    const defaultValues: SitterFormValues = {
        firstName: sitter.first_name || '',
        lastName: sitter.last_name || '',
        phone: sitter.phone_number || '',
        slug: sp.slug || '',
        tagline: sp.tagline || '',
        address: sp.address || '',
        county: sp.county || '',
        baseRate: (sp.base_rate_cents || 0) / 100,
        bio: (sp.bio || []).map((t: string) => ({ text: t })),
        skills: (sp.skills || []).map((t: string) => ({ text: t })),
        homeEnvironment: (sp.home_environment || []).map((t: string) => ({ text: t })),
        addons: (sp.sitter_addons || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            price: a.price_cents / 100,
            description: a.description || ''
        })),
        discounts: (sp.sitter_discounts || []).map((d: any) => ({
            id: d.id,
            minDays: d.min_days,
            percentage: d.percentage
        })),
    };

    const { control, register, handleSubmit, watch, formState: { errors } } = useForm<SitterFormValues>({
        resolver: zodResolver(sitterSchema),
        defaultValues
    });

    // Field Arrays
    const bioFields = useFieldArray({ control, name: "bio" });
    const skillsFields = useFieldArray({ control, name: "skills" });
    const homeFields = useFieldArray({ control, name: "homeEnvironment" });
    const addonFields = useFieldArray({ control, name: "addons" });
    const discountFields = useFieldArray({ control, name: "discounts" });

    const currentSlug = watch('slug');

    // Fetch Gallery
    useEffect(() => {
        if (activeTab === 'gallery' && currentSlug) {
            fetch(`/api/admin/gallery?slug=${currentSlug}`)
                .then(res => res.json())
                .then(data => {
                    if(data.images) setGalleryImages(data.images);
                })
                .catch(err => console.error('Error fetching gallery:', err));
        }
    }, [activeTab, currentSlug]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !currentSlug) return;
        setIsUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('slug', currentSlug);
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/gallery', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            
            // Refresh gallery
            const galleryRes = await fetch(`/api/admin/gallery?slug=${currentSlug}`);
            const data = await galleryRes.json();
            if (data.images) setGalleryImages(data.images);
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDeleteImage = async (filename: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            const res = await fetch('/api/admin/gallery', { 
                method: 'DELETE', 
                body: JSON.stringify({ slug: currentSlug, filename }) 
            });
            if (!res.ok) throw new Error('Delete failed');
            setGalleryImages(prev => prev.filter(img => img.name !== filename));
        } catch (err) {
            console.error(err);
            alert('Failed to delete image');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'services', label: 'Services & Rates', icon: DollarSign },
        { id: 'details', label: 'Details', icon: Shield }, 
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    ];

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap focus:outline-none ${
                            activeTab === tab.id
                                ? 'border-b-2 border-indigo-600 text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {/* Profile Tab */}
                <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input {...register('firstName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input {...register('lastName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                            <input {...register('slug')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input {...register('phone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Tagline</label>
                            <input {...register('tagline')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input {...register('address')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">County</label>
                            <input {...register('county')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                        </div>
                    </div>
                </div>

                {/* Services Tab */}
                <div className={activeTab === 'services' ? 'block' : 'hidden'}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Base Nightly Rate ($)</label>
                            <input type="number" {...register('baseRate', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Add-ons</label>
                                <button type="button" onClick={() => addonFields.append({ name: '', price: 0, description: '' })} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Item
                                </button>
                            </div>
                            {addonFields.fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 mb-2 items-start">
                                    <div className="flex-1">
                                        <input placeholder="Name" {...register(`addons.${index}.name`)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    </div>
                                    <div className="w-24">
                                        <input type="number" placeholder="Price" {...register(`addons.${index}.price`, { valueAsNumber: true })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    </div>
                                    <div className="flex-1">
                                        <input placeholder="Description" {...register(`addons.${index}.description`)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    </div>
                                    <button type="button" onClick={() => addonFields.remove(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Length of Stay Discounts</label>
                                <button type="button" onClick={() => discountFields.append({ minDays: 7, percentage: 10 })} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Discount
                                </button>
                            </div>
                            {discountFields.fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 mb-2 items-center">
                                    <span>Min Days:</span>
                                    <input type="number" {...register(`discounts.${index}.minDays`, { valueAsNumber: true })} className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    <span>Percentage Off (%):</span>
                                    <input type="number" {...register(`discounts.${index}.percentage`, { valueAsNumber: true })} className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    <button type="button" onClick={() => discountFields.remove(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details Tab */}
                <div className={activeTab === 'details' ? 'block' : 'hidden'}>
                    <div className="space-y-6">
                        {/* Bio */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Bio Paragraphs</label>
                                <button type="button" onClick={() => bioFields.append({ text: '' })} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Paragraph
                                </button>
                            </div>
                            {bioFields.fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mb-2">
                                    <textarea {...register(`bio.${index}.text`)} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    <button type="button" onClick={() => bioFields.remove(index)} className="text-red-500 p-2 h-fit mt-2 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Skills</label>
                                <button type="button" onClick={() => skillsFields.append({ text: '' })} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Skill
                                </button>
                            </div>
                            {skillsFields.fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mb-2">
                                    <input {...register(`skills.${index}.text`)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    <button type="button" onClick={() => skillsFields.remove(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Home Environment */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Home Environment</label>
                                <button type="button" onClick={() => homeFields.append({ text: '' })} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Detail
                                </button>
                            </div>
                            {homeFields.fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mb-2">
                                    <input {...register(`homeEnvironment.${index}.text`)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    <button type="button" onClick={() => homeFields.remove(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gallery Tab */}
                <div className={activeTab === 'gallery' ? 'block' : 'hidden'}>
                    <div className="mb-6">
                        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                            <span className="flex items-center space-x-2">
                                <Upload className="w-6 h-6 text-gray-600" />
                                <span className="font-medium text-gray-600">
                                    {isUploading ? 'Uploading...' : 'Drop files to Attach, or browse'}
                                </span>
                            </span>
                            <input type="file" name="file_upload" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((img) => (
                            <div key={img.name} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.name)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
