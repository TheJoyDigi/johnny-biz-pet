import Head from "next/head";
import { useRef } from "react";
import { GetServerSideProps } from "next";
import BookingSection from "@/components/landing/BookingSection";
import { Sitter } from "@/data/sitters";
import { fetchSittersFromDb } from "@/lib/sitters-db";

interface BookPageProps {
  sitters: Sitter[];
}

export default function BookPage({ sitters }: BookPageProps) {
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

export const getServerSideProps: GetServerSideProps = async () => {
  const sitters = await fetchSittersFromDb();
  return {
    props: {
      sitters,
    },
  };
};
