import type { SitterReview } from "./sitters";

const testimonialsBySitter: Record<string, SitterReview[]> = {};

export function getTestimonialsForSitter(uid: string): SitterReview[] {
  return testimonialsBySitter[uid] ?? [];
}

export default testimonialsBySitter;