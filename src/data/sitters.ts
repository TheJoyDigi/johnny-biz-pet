import sitterData from "../../data/sitters.json";
import testimonialsBySitter from "./testimonials";

export type SitterLocation = {
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  serviceRadiusMiles: number;
};

export type SitterBadge = {
  key: string;
  title: string;
  description: string;
  earned: boolean;
};

export type SitterAddOn = {
  name: string;
  price?: string;
  description?: string;
};

export type SitterAddOnCategory = {
  category: string;
  items: SitterAddOn[];
};

export type SitterPrimaryService = {
  name: string;
  description: string;
  price?: string;
};

export type SitterServices = {
  primary: SitterPrimaryService[];
  addOns?: SitterAddOnCategory[];
};

export type SitterGalleryPhoto = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type SitterPolicy = {
  label: string;
  detail: string;
};

export type SitterPolicies = {
  cancellation: SitterPolicy[];
  extendedCare: SitterPolicy[];
};

export type SitterDiscount = {
  label: string;
  detail: string;
};

export type SitterDiscounts = {
  lengthOfStay?: SitterDiscount[];
  referral?: SitterDiscount[];
  additionalDog?: SitterDiscount[];
};

export type SitterReview = {
  id: string;
  client: string;
  pet: string;
  rating: number;
  date: string;
  text: string;
  image?: string | null;
  source?: string;
};

export type Sitter = {
  id: string;
  slug: string;
  uid: string;
  name: string;
  tagline: string;
  avatar: string;
  heroImage: string;
  locations: SitterLocation[];
  bio: string[];
  careStyle?: string[];
  parentExpectations?: string[];
  skills?: string[];
  homeEnvironment: string[];
  badges: SitterBadge[];
  services: SitterServices;
  policies?: SitterPolicies;
  discounts?: SitterDiscounts;
  gallery?: SitterGalleryPhoto[];
  reviews: SitterReview[];
  availabilityNotes?: string;
  contactEmail?: string;
};

const parsedSitters = sitterData as any[];

export const sitters: Sitter[] = parsedSitters.map((sitter) => ({
  ...sitter,
  slug: sitter.id, // Map legacy ID to slug
  reviews: testimonialsBySitter[sitter.uid] ?? sitter.reviews ?? [],
}));

export function getSitterById(id: string): Sitter | undefined {
  return sitters.find((sitter) => sitter.id === id);
}
