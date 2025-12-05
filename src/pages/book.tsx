import Head from "next/head";
import { useRef } from "react";
import BookingSection from "@/components/landing/BookingSection";
import { sitters } from "@/data/sitters";

export default function BookPage() {
  const bookingRef = useRef<HTMLElement>(null);

  return (
    <>
      <Head>
        <title>Book a Stay | Ruh-Roh Retreat</title>
        <meta
          name="description"
          content="Book your dog's staycation with one of our badge-verified sitters."
        />
      </Head>
      <main>
        <BookingSection sectionRef={bookingRef} sitters={sitters} />
      </main>
    </>
  );
}
