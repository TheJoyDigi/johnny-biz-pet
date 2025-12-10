
import { Post, BookingRequest, Sitter, Customer, Pet, BookingNote } from "@/core/types";

export const mockCustomer: Customer = {
    id: "uuid-cust-1",
    name: "John Doe",
    email: "john@example.com",
    created_at: "2023-01-01T12:00:00Z"
};

export const mockPet: Pet = {
    id: "uuid-pet-1",
    customer_id: "uuid-cust-1",
    name: "Buddy",
    breed: "Golden Retriever",
    age: 3,
    notes: "loves tennis balls",
    created_at: "2023-01-01T12:00:00Z"
};

export const mockUser = {
  id: "user-1",
  email: "sitter@example.com",
  first_name: "Jane",
  last_name: "Smith",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString()
};

export const mockBooking: BookingRequest = {
    id: "booking-1",
    customer_id: "uuid-cust-1",
    start_date: "2023-11-20",
    end_date: "2023-11-25",
    county: "County Name",
    status: "ACCEPTED",
    assigned_sitter_id: "johnny-irvine",
    total_cost_cents: 20000,
    base_rate_at_booking_cents: 5000,
    discount_applied_cents: 0,
    addons_total_cost_cents: 0,
    platform_fee_cents: 0,
    sitter_payout_cents: 18000,
    payment_status: "PAID",
    amount_paid_cents: 20000,
    payment_method: "card",
    paid_at: "2023-11-19T10:00:00Z",
    created_at: "2023-11-18T10:00:00Z",
    customers: mockCustomer,
    booking_pets: [{ pets: mockPet }],
    booking_addons: [],
    booking_sitter_recipients: [],
    booking_notes: [],
    assigned_sitter: null
};

// Based on Post type
export const mockPosts: Post[] = [
    {
        id: "post-1",
        slug: "top-5-dog-friendly-parks-irvine",
        title: "Top 5 Dog Friendly Parks in Irvine",
        description: "Discover the best places to take your furry friend for a run in Irvine.",
        date: "2023-10-15",
        content: `
# Discover Irvine's Best Parks

Irvine is known for its beautiful parks. Here are the top 5 dog-friendly ones:

1. **Central Bark Dog Park**: A classic choice.
2. **Quail Hill Loop Trail**: Great for hiking with dogs.
3. **William R Mason Regional Park**: Scenic lake views.
4. **Jeffrey Open Space Trail**: Long trail for active pups.
5. **Great Park**: Lots of space to explore.

Enjoy your walks!
        `,
        author: "Ruh-Roh Team",
        hasCoverImage: true,
        coverImage: "https://picsum.photos/seed/post1/800/600"
    },
    {
        id: "post-2",
        slug: "how-to-prepare-for-boarding",
        title: "How to Prepare Your Dog for Boarding",
        description: "Tips to ensure your dog has a stress-free staycation.",
        date: "2023-09-20",
        content: "Preparation is key...",
        author: "Ruh-Roh Team",
        hasCoverImage: false,
    },
    {
        id: "post-3",
        slug: "summer-safety-tips",
        title: "Summer Safety Tips for Dogs",
        description: "Keep your pup cool and safe during the hot California summer.",
        date: "2023-06-10",
        content: "Hydration is important...",
        author: "Ruh-Roh Team",
        hasCoverImage: true,
        coverImage: "https://picsum.photos/seed/post3/800/600"
    }
];

export const mockSitter: Sitter = {
    id: "johnny-irvine",
    user: mockUser,
    sitter_addons: [],
    sitter_discounts: [],
    sitter_primary_services: []
}
