import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, MapPin, DollarSign, Shield, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

// Zod Schema
const sitterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  tagline: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isActive: z.boolean(),
  avatarUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  bio: z.array(z.object({ text: z.string() })),
  skills: z.array(z.object({ text: z.string() })),
  homeEnvironment: z.array(z.object({ text: z.string() })),
  careStyle: z.array(z.object({ text: z.string() })),
  parentExpectations: z.array(z.object({ text: z.string() })),
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
  locationDetails: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    formattedAddress: z.string().optional()
  }).optional(),
  services: z.array(z.object({
    serviceTypeId: z.string(),
    price: z.number().min(0),
    enabled: z.boolean()
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
    serviceTypes: any[];
    onSubmit: (data: SitterFormValues) => Promise<void>;
    isSubmitting: boolean;
}

// Helper for centering crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function SitterForm({ sitter, serviceTypes, onSubmit, isSubmitting }: SitterFormProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [galleryImages, setGalleryImages] = useState<{name: string, url: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Google Maps
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
    });
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    // Cropper State
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imgSrc, setImgSrc] = useState('');
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropType, setCropType] = useState<'avatar' | 'hero' | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Initialize default values
    const sp = sitter.sitter_profile || {};
    const defaultValues: SitterFormValues = {
        firstName: sitter.first_name || '',
        lastName: sitter.last_name || '',
        phone: sitter.phone_number || '',
        slug: sp.slug || '',
        tagline: sp.tagline || '',
        address: sp.address || '',
        lat: sp.lat || 0,
        lng: sp.lng || 0,
        isActive: sp.is_active ?? false,
        avatarUrl: sp.avatar_url || '',
        heroImageUrl: sp.hero_image_url || '',
        bio: (sp.bio || []).map((t: string) => ({ text: t })),
        skills: (sp.skills || []).map((t: string) => ({ text: t })),
        homeEnvironment: (sp.home_environment || []).map((t: string) => ({ text: t })),
        careStyle: (sp.care_style || []).map((t: string) => ({ text: t })),
        parentExpectations: (sp.parent_expectations || []).map((t: string) => ({ text: t })),
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
        locationDetails: sp.location_details || {},
        services: serviceTypes.map((st: any) => {
            const existing = (sp.sitter_primary_services || []).find((s: any) => s.service_types && s.service_types.id === st.id);
            return {
                serviceTypeId: st.id,
                price: existing ? existing.price_cents / 100 : 0,
                enabled: !!existing
            };
        }),
    };

    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SitterFormValues>({
        resolver: zodResolver(sitterSchema),
        defaultValues
    });

    // Field Arrays
    const bioFields = useFieldArray({ control, name: "bio" });
    const skillsFields = useFieldArray({ control, name: "skills" });
    const homeFields = useFieldArray({ control, name: "homeEnvironment" });
    const careStyleFields = useFieldArray({ control, name: "careStyle" });
    const parentExpectationsFields = useFieldArray({ control, name: "parentExpectations" });
    const addonFields = useFieldArray({ control, name: "addons" });
    const discountFields = useFieldArray({ control, name: "discounts" });
    const { fields: serviceFields } = useFieldArray({ control, name: "services" });

    const currentSlug = watch('slug');
    const avatarUrl = watch('avatarUrl');
    const heroImageUrl = watch('heroImageUrl');

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

    // Google Maps Handlers
    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            
            if (place.formatted_address) {
                setValue('address', place.formatted_address);
            }
            if (place.geometry && place.geometry.location) {
                setValue('lat', place.geometry.location.lat());
                setValue('lng', place.geometry.location.lng());
            }

            // Extract location details (City, State, Zip)
            if (place.address_components) {
                let city = '';
                let state = '';
                let zip = '';
                let country = '';

                place.address_components.forEach(component => {
                    const types = component.types;
                    if (types.includes('locality')) {
                        city = component.long_name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                        state = component.short_name;
                    }
                    if (types.includes('postal_code')) {
                        zip = component.long_name;
                    }
                    if (types.includes('country')) {
                        country = component.long_name;
                    }
                });
                
                // Fallback for City if locality is missing (e.g. some obscure places)
                // Sublocality or administrative_area_level_2 might be needed?
                // Keeping it simple for now as requested.

                setValue('locationDetails', { city, state, zip, country, formattedAddress: place.formatted_address });

                // Auto-generate slug if empty
                const currentSlug = watch('slug');
                const firstName = watch('firstName');
                const lastName = watch('lastName');

                if (!currentSlug && city && firstName) {
                    const generated = `${firstName}-${lastName || ''}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setValue('slug', generated);
                }
            }
        }
    };

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'hero') => {
        if (e.target.files && e.target.files.length > 0) {
            setCropType(type);
            setCrop(undefined); // Reset crop
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setShowCropModal(true);
            // Reset input value so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const aspect = cropType === 'avatar' ? 1 : 16 / 9;
        setCrop(centerAspectCrop(width, height, aspect));
    };

    const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('No 2d context');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height,
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleCropSave = async () => {
        if (completedCrop && imgRef.current && cropType) {
            try {
                const blob = await getCroppedImg(imgRef.current, completedCrop);
                await handleImageUpload(blob, cropType);
                setShowCropModal(false);
                setImgSrc('');
            } catch (e) {
                console.error('Error cropping image:', e);
                alert('Error creating cropped image');
            }
        }
    };

    const handleImageUpload = async (fileOrEvent: React.ChangeEvent<HTMLInputElement> | Blob, type: 'gallery' | 'avatar' | 'hero' = 'gallery') => {
        if (!currentSlug) return;
        
        let file: File | Blob;
        if (fileOrEvent instanceof Blob) {
            file = fileOrEvent;
        } else {
            // This is for gallery direct upload
            if (!fileOrEvent.target.files?.length) return;
            file = fileOrEvent.target.files[0];
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('slug', currentSlug);
        // Use a generic name for blob, the server/handler should rename it or we append type
        // For avatars/heroes, we might want specific filenames like 'avatar.jpg' or 'hero.jpg'
        // The API should handle this logic based on 'type'
        formData.append('file', file, 'upload.jpg'); 
        formData.append('type', type);

        try {
            const res = await fetch('/api/admin/gallery', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            
            const data = await res.json();
            if (data.url) {
                if (type === 'avatar') setValue('avatarUrl', data.url);
                else if (type === 'hero') setValue('heroImageUrl', data.url);
                else if (type === 'gallery') {
                    // Refresh gallery
                    const galleryRes = await fetch(`/api/admin/gallery?slug=${currentSlug}`);
                    const gData = await galleryRes.json();
                    if (gData.images) setGalleryImages(gData.images);
                }
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
            if (!(fileOrEvent instanceof Blob) && fileOrEvent.target) {
                 fileOrEvent.target.value = '';
            }
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
        <div className="bg-white rounded-lg shadow overflow-hidden relative">
            {/* Crop Modal */}
            {showCropModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <h3 className="text-lg font-medium mb-4">Crop {cropType === 'avatar' ? 'Avatar' : 'Hero Image'}</h3>
                        <div className="flex-1 overflow-auto flex justify-center bg-gray-100 rounded mb-4">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={cropType === 'avatar' ? 1 : 16 / 9}
                            >
                                <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
                            </ReactCrop>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => { setShowCropModal(false); setImgSrc(''); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCropSave}
                                disabled={isUploading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isUploading ? 'Saving...' : 'Save & Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Tabs and Actions */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50">
                <div className="flex overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap focus:outline-none border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600 bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {/* Profile Tab */}
                <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Active Status Toggle */}
                        <div className="col-span-2 flex items-center mb-4">
                            <div className="flex items-center h-5">
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    {...register('isActive')}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isActive" className="font-medium text-gray-700">Active Profile</label>
                                <p className="text-gray-500">When disabled, this sitter will not be visible to the public.</p>
                            </div>
                        </div>

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
                        
                        {/* Avatar Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Avatar)</label>
                            <div className="flex items-center space-x-4">
                                {avatarUrl ? (
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200">
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                                    Change
                                    <input type="file" className="hidden" onChange={(e) => onSelectFile(e, 'avatar')} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        {/* Hero Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                            <div className="flex items-center space-x-4">
                                {heroImageUrl ? (
                                    <div className="relative w-32 h-20 rounded-md overflow-hidden border border-gray-200">
                                        <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-32 h-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                                    Change
                                    <input type="file" className="hidden" onChange={(e) => onSelectFile(e, 'hero')} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            {isLoaded ? (
                                <Autocomplete
                                    onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                                    onPlaceChanged={onPlaceChanged}
                                >
                                    <input {...register('address')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" placeholder="Start typing address..." />
                                </Autocomplete>
                            ) : (
                                <input {...register('address')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                            )}
                        </div>
                        
                        {/* Hidden Inputs for Lat/Lng */}
                        <input type="hidden" {...register('lat', { valueAsNumber: true })} />
                        <input type="hidden" {...register('lng', { valueAsNumber: true })} />
                    </div>
                </div>

                {/* Services Tab */}
                <div className={activeTab === 'services' ? 'block' : 'hidden'}>
                    <div className="space-y-6">


                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Rates</h3>
                            <div className="space-y-4">
                                {serviceFields.map((field, index) => {
                                    const st = serviceTypes.find(t => t.id === field.serviceTypeId);
                                    return (
                                        <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register(`services.${index}.enabled`)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <div className="ml-3">
                                                    <span className="block text-sm font-medium text-gray-700">{st?.name || 'Unknown Service'}</span>
                                                    {st?.description && <span className="block text-xs text-gray-500">{st.description}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-500 mr-2">$</span>
                                                <input
                                                    type="number"
                                                    {...register(`services.${index}.price`, { valueAsNumber: true })}
                                                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {/* Hidden input to keep serviceTypeId bound */}
                                            <input type="hidden" {...register(`services.${index}.serviceTypeId`)} />
                                        </div>
                                    );
                                })}
                            </div>
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

                        {/* Care Style */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">My Care Style</label>
                                <button type="button" onClick={() => careStyleFields.append({ text: '' })} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Detail
                                </button>
                            </div>
                            {careStyleFields.fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mb-2">
                                    <input {...register(`careStyle.${index}.text`)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    <button type="button" onClick={() => careStyleFields.remove(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Parent Expectations */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">What Pet Parents Can Expect</label>
                                <button type="button" onClick={() => parentExpectationsFields.append({ text: '' })} className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Detail
                                </button>
                            </div>
                            {parentExpectationsFields.fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 mb-2">
                                    <input {...register(`parentExpectations.${index}.text`)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                                    <button type="button" onClick={() => parentExpectationsFields.remove(index)} className="text-red-500 p-2 hover:bg-red-50 rounded">
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
                            <input type="file" name="file_upload" className="hidden" onChange={(e) => handleImageUpload(e, 'gallery')} disabled={isUploading} />
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
