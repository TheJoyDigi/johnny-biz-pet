import { ChangeEvent, FormEvent, RefObject, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { Sitter, SitterPrimaryService } from "@/data/sitters";

type BookingForm = {
  sitterId: string;
  serviceId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  petName: string;
  petType: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  addons: { [key: string]: boolean };
  notes: string;
};

type BookingSectionProps = {
  sectionRef: RefObject<HTMLElement>;
  sitters: Sitter[];
};

function BookingSection({ sectionRef, sitters }: BookingSectionProps) {
  const router = useRouter();
  const defaultSitter = sitters[0];
  const [selectedSitter, setSelectedSitter] = useState<Sitter>(defaultSitter);
  const [bookingForm, setBookingForm] = useState<BookingForm>(() => ({
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
  }));
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [nightsCount, setNightsCount] = useState<number | null>(null);
  const todayISO = new Date().toISOString().split("T")[0];
  
  const sitterAddOns = selectedSitter?.services.addOns ?? [];
  const [lastQuerySitter, setLastQuerySitter] = useState<string | null>(null);

  const applySitterSelection = useCallback((newSitter: Sitter) => {
    setSelectedSitter(newSitter);
    setBookingForm((prev) => ({
      ...prev,
      sitterId: newSitter.id,
      serviceId: newSitter.services.primary[0]?.name ?? "",
      addons: {},
    }));
  }, []);

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

    if (matchingSitter && matchingSitter.id !== selectedSitter.id) {
      applySitterSelection(matchingSitter);
    }

    setLastQuerySitter(sitterUid);
  }, [router.isReady, router.query.sitter, sitters, selectedSitter.id, applySitterSelection, lastQuerySitter]);

  useEffect(() => {
    if (bookingForm.startDate && bookingForm.endDate) {
      const start = new Date(bookingForm.startDate);
      const end = new Date(bookingForm.endDate);

      if (end < start) {
        setErrors((prev) => ({ ...prev, date: "End date must be after start date" }));
        setNightsCount(null);
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.date;
          return newErrors;
        });
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNightsCount(diffDays);
      }
    } else {
      setNightsCount(null);
    }
  }, [bookingForm.startDate, bookingForm.endDate]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBookingForm({
      ...bookingForm,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSitterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const sitterId = e.target.value;
    const newSitter = sitters.find((s) => s.id === sitterId);
    if (!newSitter) return;

    applySitterSelection(newSitter);
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBookingForm({
      ...bookingForm,
      addons: {
        ...bookingForm.addons,
        [name]: checked,
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    (window as any).clarity?.("event", "Request Booking Clicked");

    const newErrors: { [key: string]: string } = {};

    if (errors.date) {
      newErrors.date = errors.date;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone (US phone number format)
    // Matches: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +1 123 456 7890
    const phoneRegex = /^(\+?1\s?)?(\([2-9]\d{2}\)|[2-9]\d{2})[-.\s]?\d{3}[-.\s]?\d{4}$/;
    if (!phoneRegex.test(bookingForm.phone)) {
      newErrors.phone = "Please enter a valid US phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      const firstErrorField = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`);
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingForm,
          sitterName: selectedSitter.name,
          locationName: selectedSitter.locations[0].city, // Assuming first location for now
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred while submitting your booking request");
      }

      setFormSubmitted(true);

      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      setBookingForm({
        sitterId: selectedSitter?.id ?? sitters[0]?.id ?? "",
        serviceId: selectedSitter?.services.primary[0]?.name ?? sitters[0]?.services.primary[0]?.name ?? "",
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
      });
      setNightsCount(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your booking request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto text-center">
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
            <form onSubmit={handleSubmit}>
              {/* 1. Sitter Selection */}
              <div className="mb-6">
                <label htmlFor="sitterId" className="block text-gray-700 font-medium mb-2">
                  Select Sitter *
                </label>
                <select
                  id="sitterId"
                  name="sitterId"
                  required
                  value={selectedSitter?.id}
                  onChange={handleSitterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                >
                  {sitters.map((sitter) => (
                    <option key={sitter.id} value={sitter.id}>
                      {sitter.name}
                    </option>
                  ))}
                </select>
                {selectedSitter && (
                  <p className="mt-2 text-sm text-gray-600">
                    Location: {selectedSitter.locations.map(l => l.city).join(", ")}
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
                  name="serviceId"
                  required
                  value={bookingForm.serviceId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                >
                  {selectedSitter?.services.primary.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} {service.price ? `(${service.price})` : ""}
                    </option>
                  ))}
                </select>
                {bookingForm.serviceId && (
                   <p className="mt-2 text-sm text-gray-600">
                     {selectedSitter?.services.primary.find(s => s.name === bookingForm.serviceId)?.description}
                   </p>
                )}
              </div>

              {/* 2. Pick Up Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                    Drop Off Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    min={todayISO}
                    value={bookingForm.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  />
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">
                    Drop Off Time *
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    required
                    value={bookingForm.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  />
                </div>
              </div>

              {/* 3. Drop Off Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
                    Pick Up Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    min={bookingForm.startDate || todayISO}
                    value={bookingForm.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.date ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#1A9CB0]"
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-gray-700 font-medium mb-2">
                    Pick Up Time *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    required
                    value={bookingForm.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  />
                </div>
              </div>

              {nightsCount !== null && (
                <div className="mb-6 text-gray-700">
                  <p>
                    Total nights: <span className="font-semibold">{nightsCount}</span>
                  </p>
                </div>
              )}

              {errors.date && <p className="text-red-500 mb-6 text-sm">{errors.date}</p>}



              {/* 5. Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={bookingForm.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={bookingForm.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  />
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
                    name="email"
                    required
                    value={bookingForm.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#1A9CB0]"
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={bookingForm.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#1A9CB0]"
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
                    name="petName"
                    required
                    value={bookingForm.petName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  />
                </div>
                <div>
                  <label htmlFor="petType" className="block text-gray-700 font-medium mb-2">
                    Pet Type *
                  </label>
                  <select
                    id="petType"
                    name="petType"
                    required
                    value={bookingForm.petType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* 7. Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={bookingForm.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A9CB0]"
                  placeholder="Tell us about any special requirements, your pet's routine, or other important details..."
                ></textarea>
              </div>

              {/* 8. Add-ons */}
              {sitterAddOns.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Enhance Your Pet's Stay</h3>
                  <p className="text-gray-600 mb-4">
                    Select any add-ons you'd like to include. You can always modify these later during our meet & greet.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sitterAddOns.map(({ category, items }) => (
                      <div key={category} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">{category}</h4>
                        <div className="space-y-2">
                          {items.map((addon) => (
                            <label key={`${category}-${addon.name}`} className="flex items-start">
                              <input
                                type="checkbox"
                                name={addon.name}
                                checked={!!bookingForm.addons[addon.name]}
                                onChange={handleCheckboxChange}
                                className="mt-1 mr-3 h-4 w-4 text-[#F28C38] focus:ring-[#F28C38] border-gray-300 rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-800">{addon.name}</p>
                                {addon.description && <p className="text-sm text-gray-600">{addon.description}</p>}
                                {addon.price && (
                                  <p className="text-sm font-semibold text-[#F28C38]">{addon.price}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  className={`${
                    isSubmitting || Object.keys(errors).length > 0
                      ? "bg-gray-400"
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
