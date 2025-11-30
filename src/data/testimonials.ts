import johnnyReviewsData from "../../public/sitters/sr-001/reviews/reviews.json";
import trudyReviewsData from "../../public/sitters/sr-002/reviews/reviews.json";
import type { SitterReview } from "./sitters";

type RawReview = {
  id: number;
  name: string;
  date: string;
  text: string;
  image?: string;
  rating: number;
  pet?: string;
  service?: string;
};

const mapReviews = (
  reviews: RawReview[],
  options: { prefix: string; defaultPet: string; defaultSource: string }
): SitterReview[] =>
  reviews.map((review) => ({
    id: `${options.prefix}-${review.id}`,
    client: review.name,
    pet: review.pet ?? options.defaultPet,
    rating: review.rating,
    date: review.date,
    text: review.text,
    image: review.image ?? null,
    source: review.service ?? options.defaultSource,
  }));

const johnnyTestimonials = mapReviews(johnnyReviewsData as RawReview[], {
  prefix: "johnny",
  defaultPet: "Family Pup",
  defaultSource: "Rover",
});

const trudyTestimonials = mapReviews(trudyReviewsData as RawReview[], {
  prefix: "trudy",
  defaultPet: "Guest Pup",
  defaultSource: "Community",
});

const testimonialsBySitter: Record<string, SitterReview[]> = {
  "sr-001": johnnyTestimonials,
  "sr-002": trudyTestimonials,
};

export function getTestimonialsForSitter(uid: string): SitterReview[] {
  return testimonialsBySitter[uid] ?? [];
}

export default testimonialsBySitter;
