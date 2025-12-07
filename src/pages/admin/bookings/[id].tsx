import BookingNotes from "@/components/booking-notes";
import PaymentBreakdown from "@/components/payment-breakdown";
import {
  type BookingRequest,
  type NotifiedSitter,
  type Pet,
  type Sitter,
} from "@/core/types";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "../_layout";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {},
        remove(name: string, options: CookieOptions) {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const { id } = context.params!;

  const { data: booking, error } = await supabase
    .from("booking_requests")
    .select(
      "*, customers(*), booking_pets(pets(*)), booking_addons(*, sitter_addons(*)), booking_notes(*, user:users(first_name, last_name)), booking_sitter_recipients(*, sitters(*, users(first_name, last_name))), assigned_sitter:sitters!booking_requests_assigned_sitter_id_fkey(*, user:users(*)))"
    )
    .eq("id", id)
    .single();

  if (error || !booking) {
    return { notFound: true };
  }

  let notifiedSitters: Sitter[] = [];
  // @ts-ignore
  if (booking.status === "PENDING_SITTER_ACCEPTANCE") {
    // @ts-ignore
    const sitterIds = booking.booking_sitter_recipients.map((r: NotifiedSitter) => r.sitters?.id);
    const { data: sitters, error: sittersError } = await supabase
      .from("sitters")
      .select("*, user:users(*), sitter_addons(*), sitter_discounts(*)")
      .in("id", sitterIds);
    if (sitters) {
      notifiedSitters = sitters as Sitter[];
    }
    // @ts-ignore
  } else if (booking.assigned_sitter) {
    const { data: sitter, error: sitterError } = await supabase
      .from("sitters")
      .select("*, users(*), sitter_addons(*), sitter_discounts(*)")
      // @ts-ignore
      .eq("id", booking.assigned_sitter.id)
      .single();
    if (sitter) {
      // @ts-ignore
      booking.assigned_sitter = sitter as Sitter;
    }
  }

  return { props: { user, booking, notifiedSitters } };
};

interface BookingDetailsPageProps {
  user: any; // Replace with a more specific user type if available
  booking: BookingRequest;
  notifiedSitters: Sitter[];
}

function BookingDetailsPage({
  user,
  booking: initialBooking,
  notifiedSitters,
}: BookingDetailsPageProps) {
  const [bookingRequest, setBookingRequest] = useState(initialBooking);
  const supabase = createBrowserClient();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] =
    useState<Partial<BookingRequest>>(initialBooking);
  const [paymentLink, setPaymentLink] = useState("");

  const handleGeneratePaymentLink = async () => {
    setError("");
    setIsSubmitting(true);
    setPaymentLink("");

    try {
      const response = await fetch("/api/bookings/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: bookingRequest.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to generate payment link");
      }

      const data = await response.json();
      setPaymentLink(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (!bookingRequest) return;

    const channel = supabase
      .channel(`booking-details-${bookingRequest.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booking_requests",
          filter: `id=eq.${bookingRequest.id}`,
        },
        (payload) => {
          setBookingRequest((prev: BookingRequest) => ({
            ...prev,
            ...(payload.new as BookingRequest),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, bookingRequest]);

  const handleSave = async () => {
    setError("");
    setIsSubmitting(true);

    const updateData = { ...bookingRequest, ...editedBooking };

    const response = await fetch("/api/admin/update-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (response.ok) {
      const updatedBooking = await response.json();
      setBookingRequest(updatedBooking.data);
      setIsEditing(false);
    } else {
      const errorData = await response.json();
      setError(errorData.message || "Failed to update booking");
    }

    setIsSubmitting(false);
  };

  const handleUpdatePaymentStatus = async () => {
    setError("");
    setIsSubmitting(true);
    const { error } = await supabase
      .from("booking_requests")
      .update({ payment_status: "PAID" })
      .eq("id", bookingRequest.id);

    if (error) {
      setError(error.message);
    } else {
      router.replace(router.asPath);
    }
    setIsSubmitting(false);
  };

  const handleCancelBooking = async () => {
    setError("");
    setIsSubmitting(true);
    const { error } = await supabase
      .from("booking_requests")
      .update({ status: "CANCELED_BY_ADMIN" })
      .eq("id", bookingRequest.id);

    if (error) {
      setError(error.message);
    } else {
      router.replace(router.asPath);
    }
    setIsSubmitting(false);
  };

  if (!bookingRequest) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Booking Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Booking
              </h2>
              <p>
                <strong>Dates:</strong> {bookingRequest.start_date} to{" "}
                {bookingRequest.end_date}
              </p>
              <p>
                <strong>Nights:</strong>{" "}
                {calculateNights(
                  bookingRequest.start_date,
                  bookingRequest.end_date
                )}
              </p>
              <p>
                <strong>Status:</strong> {bookingRequest.status}
              </p>
              <p>
                <strong>Payment Status:</strong> {bookingRequest.payment_status}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Customer
              </h2>
              <p>
                <strong>Name:</strong> {bookingRequest.customers?.name}
              </p>
              <p>
                <strong>Email:</strong> {bookingRequest.customers?.email}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Notified Sitters
              </h2>
              <ul>
                {bookingRequest.booking_sitter_recipients?.map(
                  (recipient: NotifiedSitter) => (
                    <li key={recipient.sitters?.id}>
                      {recipient.sitters?.users?.first_name}{" "}
                      {recipient.sitters?.users?.last_name} - {recipient.status}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Pets
              </h2>
              <ul>
                {bookingRequest.booking_pets?.map(({ pets }: { pets: Pet }) => (
                  <li key={pets.id}>
                    {pets.name} ({pets.breed})
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Add-ons
              </h2>
              <ul>
                {bookingRequest.booking_addons?.map(
                  ({
                    sitter_addons,
                  }: {
                    sitter_addons: {
                      id: string;
                      name: string;
                      price_cents: number;
                    };
                  }) => (
                    <li key={sitter_addons.id}>
                      {sitter_addons.name} (${sitter_addons.price_cents / 100})
                    </li>
                  )
                )}
              </ul>
            </div>
            {bookingRequest.status === "PENDING_SITTER_ACCEPTANCE" ? (
              notifiedSitters.map((sitter) => (
                <div
                  key={sitter.id}
                  className="bg-white rounded-lg shadow p-6 mb-6"
                >
                  <h3 className="text-xl font-bold mb-2">
                    Cost Breakdown for {sitter.user.first_name}{" "}
                    {sitter.user.last_name}
                  </h3>
                  <PaymentBreakdown
                    booking={bookingRequest}
                    sitter={sitter}
                    nights={calculateNights(
                      bookingRequest.start_date,
                      bookingRequest.end_date
                    )}
                  />
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                  Cost Breakdown
                </h2>
                {bookingRequest.assigned_sitter && (
                  <PaymentBreakdown
                    booking={bookingRequest}
                    sitter={bookingRequest.assigned_sitter}
                    nights={calculateNights(
                      bookingRequest.start_date,
                      bookingRequest.end_date
                    )}
                  />
                )}
              </div>
            )}
            <BookingNotes
              bookingId={bookingRequest.id}
              notes={bookingRequest.booking_notes || []}
              user={user}
            />
          </div>
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Actions
              </h2>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleUpdatePaymentStatus}
                  disabled={
                    isSubmitting || bookingRequest.payment_status === "PAID"
                  }
                  className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={handleGeneratePaymentLink}
                  disabled={isSubmitting}
                  className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Generate Payment Link
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={
                    isSubmitting ||
                    bookingRequest.status === "CANCELED_BY_ADMIN"
                  }
                  className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                  Cancel Booking
                </button>
              </div>
              {paymentLink && (
                <div className="mt-4 p-4 text-sm bg-green-50 rounded-lg break-all">
                  <p className="font-bold text-green-800 mb-1">Payment Link Generated:</p>
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
                    {paymentLink}
                  </a>
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Edit Booking
              </h3>
              <div className="mt-2 px-7 py-3">
                <form className="text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editedBooking.start_date}
                        onChange={(e) =>
                          setEditedBooking({
                            ...editedBooking,
                            start_date: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={editedBooking.end_date}
                        onChange={(e) =>
                          setEditedBooking({
                            ...editedBooking,
                            end_date: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={editedBooking.status}
                        onChange={(e) =>
                          setEditedBooking({
                            ...editedBooking,
                            status: e.target.value as any,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="PENDING_SITTER_ACCEPTANCE">
                          PENDING_SITTER_ACCEPTANCE
                        </option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="DECLINED">DECLINED</option>
                        <option value="EXPIRED_UNCLAIMED">
                          EXPIRED_UNCLAIMED
                        </option>
                        <option value="CANCELED_BY_ADMIN">
                          CANCELED_BY_ADMIN
                        </option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Status
                      </label>
                      <select
                        value={editedBooking.payment_status}
                        onChange={(e) =>
                          setEditedBooking({
                            ...editedBooking,
                            payment_status: e.target.value as any,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="UNPAID">UNPAID</option>
                        <option value="PAID">PAID</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Cost (Cents)
                      </label>
                      <input
                        type="number"
                        value={editedBooking.total_cost_cents || ""}
                        onChange={(e) =>
                          setEditedBooking({
                            ...editedBooking,
                            total_cost_cents: parseInt(e.target.value),
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 ml-4"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default BookingDetailsPage;
