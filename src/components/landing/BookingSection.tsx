"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Sitter } from "@/data/sitters";

const phoneRegex = /^(\+?1\s?)?(\([2-9]\d{2}\)|[2-9]\d{2})[-.\s]?\d{3}[-.\s]?\d{4}$/;

const bookingSchema = z.object({
  sitterId: z.string().min(1, "Select Sitter is required"),
  serviceId: z.string().min(1, "Service is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Please enter a valid US phone number"),
  petName: z.string().min(1, "Pet Name is required"),
  petType: z.string().min(1, "Pet Type is required"),
  startDate: z.string().min(1, "Drop Off Date is required"),
  startTime: z.string().min(1, "Drop Off Time is required"),
  endDate: z.string().min(1, "Pick Up Date is required"),
  endTime: z.string().min(1, "Pick Up Time is required"),
  notes: z.string().optional(),
  referralSource: z.string().optional(),
  addons: z.record(z.string(), z.number()).optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "Please review and accept the Terms of Service to continue.",
  }),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "Pick Up Date must be after Drop Off Date",
  path: ["endDate"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type BookingSectionProps = {
  sectionRef: React.RefObject<HTMLElement>;
  sitters: Sitter[];
};

function BookingSection({ sectionRef, sitters }: BookingSectionProps) {
  const router = useRouter();
  const defaultSitter = sitters[0];
  const termsPdfPath = "/legal/terms-of-service.pdf";
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [nightsCount, setNightsCount] = useState<number | null>(null);
  const todayISO = new Date().toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      sitterId: defaultSitter?.id ?? "",
      serviceId: defaultSitter?.services.primary[0]?.name ?? "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      petName: "",
      petType: "dog",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "17:00",
      addons: {},
      notes: "",
      referralSource: "",
      acceptedTerms: undefined, // Let the user check it
    },
    mode: "onChange", // Validate on change to update button state in real-time
  });

  const selectedSitterId = watch("sitterId");
  const selectedSitter = sitters.find((s) => s.id === selectedSitterId) || defaultSitter;
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const serviceId = watch("serviceId");
  const addons = (watch("addons") || {}) as Record<string, number>;

  const [lastQuerySitter, setLastQuerySitter] = useState<string | null>(null);

  // Handle Sitter Query Param
  useEffect(() => {
    if (!router.isReady) return;
    const sitterQuery = router.query.sitter;
    if (!sitterQuery) {
      setLastQuerySitter(null);
      return;
    }

    const sitterUid = Array.isArray(sitterQuery) ? sitterQuery[0] : sitterQuery;
    if (lastQuerySitter === sitterUid) {
      return;
    }

    const matchingSitter =
      sitters.find((sitter) => sitter.uid === sitterUid) ??
      sitters.find((sitter) => sitter.id === sitterUid);

    if (matchingSitter && matchingSitter.id !== selectedSitterId) {
      setValue("sitterId", matchingSitter.id);
      setValue("serviceId", matchingSitter.services.primary[0]?.name ?? "");
      setValue("addons", {});
      setLastQuerySitter(sitterUid);
    }
  }, [router.isReady, router.query.sitter, sitters, selectedSitterId, lastQuerySitter, setValue]);

  // Calculate Nights
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNightsCount(diffDays);
      } else {
        setNightsCount(null);
      }
    } else {
      setNightsCount(null);
    }
  }, [startDate, endDate]);

  const onSubmit = async (data: BookingFormValues) => {
    (window as any).clarity?.("event", "Request Booking Clicked");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          sitterName: selectedSitter.name,
          locationName: selectedSitter.locations[0].city,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "An error occurred while submitting your booking request");
      }

      setFormSubmitted(true);

      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      reset();
      setNightsCount(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your booking request. Please try again later.");
    }
  };

  const handleAddonQuantityChange = (name: string, delta: number) => {
    const currentQty = addons[name] || 0;
    const newQty = Math.max(0, currentQty + delta);
    setValue("addons", { ...addons, [name]: newQty });
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };



  const baseInputClasses = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
  const getInputClasses = (hasError: boolean) =>
    `${baseInputClasses} ${hasError ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-[#1A9CB0] hover:border-[#1A9CB0]"}`;

  const renderError = (message?: string) =>
    message ? (
      <div className="mt-2 flex items-start gap-2 text-sm text-red-600 animate-fadeIn">
        <svg
          className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v4.25a.75.75 0 001.5 0V6.5zm0 6.5a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
      </div>
    ) : null;

  return (
    <section id="booking" ref={sectionRef} className="py-20 bg-[#F4F4F9]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">Book a Stay</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your trip details and preferred sitter. We will reply within 24 hours to confirm availability.
          </p>
        </div>

        {formSubmitted ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto text-center animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Booking Request Received!</h3>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your request. Our team has your booking details and will contact you shortly to confirm your reservation.
            </p>
            <button
              onClick={() => {
                setFormSubmitted(false);
                setTimeout(() => {
                  sectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="bg-[#1A9CB0] hover:bg-[#158294] text-white font-bold py-2 px-6 rounded-full text-lg transition-colors duration-300"
            >
              Make Another Booking
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* 1. Sitter Selection */}
              <div className="mb-6">
                <label htmlFor="sitterId" className="block text-gray-700 font-medium mb-2">
                  Select Sitter *
                </label>
                <select
                  id="sitterId"
                  {...register("sitterId", {
                    onChange: (e) => {
                      const newSitterId = e.target.value;
                      const newSitter = sitters.find((s) => s.id === newSitterId);
                      if (newSitter) {
                        setValue("serviceId", newSitter.services.primary[0]?.name ?? "");
                        setValue("addons", {});
                      }
                    },
                  })}
                  className={getInputClasses(!!errors.sitterId)}
                >
                  {sitters.map((sitter) => (
                    <option key={sitter.id} value={sitter.id}>
                      {sitter.name}
                    </option>
                  ))}
                </select>
                {errors.sitterId && renderError(errors.sitterId.message)}
                {selectedSitter && (
                  <p className="mt-2 text-sm text-gray-600">
                    Location: {selectedSitter.locations.map((l) => l.city).join(", ")}
                  </p>
                )}

              </div>

              {/* 2. Service Selection */}
              <div className="mb-6">
                <label htmlFor="serviceId" className="block text-gray-700 font-medium mb-2">
                  Service *
                </label>
                <select
                  id="serviceId"
                  {...register("serviceId")}
                  className={getInputClasses(!!errors.serviceId)}
                >
                  {selectedSitter?.services.primary.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} {service.price ? `(${service.price})` : ""}
                    </option>
                  ))}
                </select>
                {errors.serviceId && renderError(errors.serviceId.message)}

              </div>

              {/* 3. Dates & Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                    Drop Off Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    min={todayISO}
                    {...register("startDate")}
                    className={getInputClasses(!!errors.startDate)}
                  />
                  {errors.startDate && renderError(errors.startDate.message)}
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">
                    Drop Off Time *
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    {...register("startTime")}
                    className={getInputClasses(!!errors.startTime)}
                  />
                  {errors.startTime && renderError(errors.startTime.message)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
                    Pick Up Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    min={startDate || todayISO}
                    {...register("endDate")}
                    className={getInputClasses(!!errors.endDate)}
                  />
                  {errors.endDate && renderError(errors.endDate.message)}
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-gray-700 font-medium mb-2">
                    Pick Up Time *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    {...register("endTime")}
                    className={getInputClasses(!!errors.endTime)}
                  />
                  {errors.endTime && renderError(errors.endTime.message)}
                </div>
              </div>

              {nightsCount !== null && (
                <div className="mb-6 text-gray-700">
                  <p>
                    Total nights: <span className="font-semibold">{nightsCount}</span>
                  </p>
                </div>
              )}

              {/* 5. Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...register("firstName")}
                    className={getInputClasses(!!errors.firstName)}
                  />
                  {errors.firstName && renderError(errors.firstName.message)}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...register("lastName")}
                    className={getInputClasses(!!errors.lastName)}
                  />
                  {errors.lastName && renderError(errors.lastName.message)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email")}
                    className={getInputClasses(!!errors.email)}
                  />
                  {errors.email && renderError(errors.email.message)}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone *
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        id="phone"
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                        className={getInputClasses(!!errors.phone)}
                        placeholder="(555) 555-5555"
                      />
                    )}
                  />
                  {errors.phone && renderError(errors.phone.message)}
                </div>
              </div>

              {/* 6. Pet Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="petName" className="block text-gray-700 font-medium mb-2">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    id="petName"
                    {...register("petName")}
                    className={getInputClasses(!!errors.petName)}
                  />
                  {errors.petName && renderError(errors.petName.message)}
                </div>
                <div>
                  <label htmlFor="petType" className="block text-gray-700 font-medium mb-2">
                    Pet Type *
                  </label>
                  <select
                    id="petType"
                    {...register("petType")}
                    className={getInputClasses(!!errors.petType)}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.petType && renderError(errors.petType.message)}
                </div>
              </div>

              {/* 7. Referral Source */}
              <div className="mb-6">
                <label htmlFor="referralSource" className="block text-gray-700 font-medium mb-2">
                  How did you hear about us? <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <select
                  id="referralSource"
                  {...register("referralSource")}
                  className={getInputClasses(!!errors.referralSource)}
                >
                  <option value="">Select an option</option>
                  <option value="Yelp">Yelp</option>
                  <option value="Google">Google</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Friend/Family">Friend/Family</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* 8. Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  {...register("notes")}
                  className={getInputClasses(!!errors.notes)}
                  placeholder="Tell us about any special requirements, your pet's routine, or other important details..."
                ></textarea>
              </div>

              {/* 9. Add-ons */}
              {selectedSitter?.services.addOns && selectedSitter.services.addOns.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Enhance Your Pet's Stay</h3>
                  <p className="text-gray-600 mb-4">
                    Select any add-ons you'd like to include. You can always modify these later during our meet & greet.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSitter.services.addOns.map(({ category, items }) => (
                      <div key={category} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">{category}</h4>
                        <div className="space-y-4">
                          {items.map((addon) => (
                            <div key={`${category}-${addon.name}`} className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{addon.name}</p>
                                {addon.description && <p className="text-sm text-gray-600">{addon.description}</p>}
                                {addon.price && (
                                  <p className="text-sm font-semibold text-[#F28C38]">{addon.price}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 ml-4">
                                <button
                                  type="button"
                                  onClick={() => handleAddonQuantityChange(addon.name, -1)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                                    (addons[addon.name] || 0) > 0
                                      ? "border-[#F28C38] text-[#F28C38] hover:bg-[#F28C38] hover:text-white"
                                      : "border-gray-300 text-gray-300 cursor-not-allowed"
                                  } transition-colors`}
                                  disabled={(addons[addon.name] || 0) <= 0}
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-medium text-gray-800">
                                  {addons[addon.name] || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAddonQuantityChange(addon.name, 1)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center border border-[#F28C38] text-[#F28C38] hover:bg-[#F28C38] hover:text-white transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms acceptance */}
              <div className="mb-6">
                <label className="inline-flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("acceptedTerms")}
                    className={`mt-1 h-5 w-5 rounded border focus:outline-none focus:ring-2 ${
                      errors.acceptedTerms ? "border-red-500 text-red-500 focus:ring-red-500" : "border-gray-300 text-[#1A9CB0] focus:ring-[#1A9CB0]"
                    }`}
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    I have reviewed and agree to the{" "}
                    <Link href={termsPdfPath} target="_blank" rel="noopener noreferrer" className="text-[#1A9CB0] font-semibold hover:underline">
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>
                {errors.acceptedTerms && renderError(errors.acceptedTerms.message)}
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#F28C38] hover:bg-[#e07a26]"
                  } text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300 relative paw-button`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Request Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookingSection;
