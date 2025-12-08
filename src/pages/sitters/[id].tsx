import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import Footer from "@/components/footer";
import Header from "@/components/header";
import SitterDetail from "@/components/sitters/SitterDetail";
import { Sitter } from "@/data/sitters";
import { fetchSittersFromDb } from "@/lib/sitters-db";

type SitterPageProps = {
  sitter: Sitter;
};

const SitterPage = ({ sitter }: SitterPageProps) => {
  const primaryLocation = sitter.locations[0]?.city 
    ? `${sitter.locations[0].city}, ${sitter.locations[0].state}` 
    : "Southern California";
    
  const metaTitle = `${sitter.name} | Dog Sitter in ${primaryLocation} | Ruh-Roh Retreat`;
  const metaDescription = `Book ${sitter.name}, a verified dog sitter in ${primaryLocation}. ${sitter.tagline}. Read reviews, view photos, and request a booking at Ruh-Roh Retreat.`;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        {/* Open Graph */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={sitter.heroImage} />
        <meta property="og:type" content="profile" />
        
        {/* Structured Data for Sitter */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ProfilePage",
                "mainEntity": {
                    "@type": "Person",
                    "name": sitter.name,
                    "image": sitter.avatar || sitter.heroImage,
                    "description": sitter.bio[0],
                    "homeLocation": {
                        "@type": "Place",
                        "name": primaryLocation
                    },
                    "jobTitle": "Pet Sitter"
                }
            }),
            }}
        />
      </Head>
      <Header />
      <main className="bg-[#F4F4F9] min-h-screen py-10 sm:py-16">
        <div className="container mx-auto px-4 space-y-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <p className="uppercase tracking-widest text-sm font-semibold text-[#1A9CB0]">Sitter Profile</p>
            <Link
              href="/sitters"
              className="inline-flex items-center px-4 py-2 text-sm sm:text-base rounded-full bg-white text-[#1A9CB0] font-semibold shadow hover:shadow-md transition"
            >
              ← Back to all sitters
            </Link>
          </div>
          <SitterDetail sitter={sitter} />
          <div className="max-w-5xl mx-auto flex justify-center">
            <Link
              href="/sitters"
              className="inline-flex items-center px-5 py-3 text-sm sm:text-base rounded-full bg-white text-[#1A9CB0] font-semibold shadow hover:shadow-md transition"
            >
              ← Back to all sitters
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const sitters = await fetchSittersFromDb();
  // Generate paths based on SLUG (to keep URLs pretty)
  const paths = sitters.map((sitter) => ({ params: { id: sitter.slug } }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<SitterPageProps> = async ({ params }) => {
  const slug = params?.id; // The param is still named 'id' from filename [id].tsx, but it holds the slug
  if (typeof slug !== "string") {
    return { notFound: true };
  }

  const sitters = await fetchSittersFromDb();
  const sitter = sitters.find((s) => s.slug === slug);

  if (!sitter) {
    return { notFound: true };
  }

  return {
    props: {
      sitter,
    },
    revalidate: 10,
  };
};

export default SitterPage;
