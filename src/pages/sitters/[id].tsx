import fs from "fs";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import path from "path";

import Footer from "@/components/footer";
import Header from "@/components/header";
import SitterDetail from "@/components/sitters/SitterDetail";
import { SITE_URL, SOCIAL_IMAGE_URL } from "@/components/meta-data";
import { getSitterById, Sitter, sitters, SitterGalleryPhoto } from "@/data/sitters";

type SitterPageProps = {
  sitter: Sitter;
};

const SitterPage = ({ sitter }: SitterPageProps) => {
  const canonicalUrl = `${SITE_URL}/sitters/${sitter.id}`;
  const toAbsoluteImageUrl = (path: string | undefined) =>
    path?.startsWith("http") ? path : path ? `${SITE_URL}${path}` : SOCIAL_IMAGE_URL;
  const servedAreas = sitter.locations
    .map((location) => `${location.city}, ${location.state} ${location.postalCode}`)
    .join(" • ");
  const heroImage = toAbsoluteImageUrl(sitter.heroImage);
  const avatarImage = toAbsoluteImageUrl(sitter.avatar);
  const totalStars = sitter.reviews.reduce((sum, review) => sum + review.rating, 0);
  const reviewCount = sitter.reviews.length;
  const averageRating = reviewCount > 0 ? Number((totalStars / reviewCount).toFixed(1)) : null;

  const sitterSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: sitter.name,
    description: sitter.tagline,
    image: avatarImage,
    url: canonicalUrl,
    worksFor: {
      "@type": "Organization",
      name: "Ruh-Roh Retreat",
      url: SITE_URL,
    },
    areaServed: sitter.locations.map((location) => `${location.city}, ${location.state} ${location.postalCode}`),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Pet care services",
      itemListElement: sitter.services.primary.map((service) => ({
        "@type": "Offer",
        name: service.name,
        description: service.description,
        price: service.price,
      })),
    },
    aggregateRating:
      averageRating && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            ratingCount: reviewCount,
          }
        : undefined,
  };

  return (
    <>
      <Head>
        <title>{`${sitter.name} | ${sitter.tagline}`}</title>
        <meta
          name="description"
          content={`Meet ${sitter.name}, a Ruh-Roh Retreat sitter serving ${servedAreas} with boutique, in-home boarding.`}
        />
        <meta
          name="keywords"
          content={`${sitter.name} pet sitter, ${servedAreas} pet boarding, boutique dog boarding, Ruh-Roh sitter profile`}
        />
        <meta property="og:title" content={`${sitter.name} | ${sitter.tagline}`} />
        <meta
          property="og:description"
          content={`Book ${sitter.name} for boutique boarding with transparent reviews, badge achievements, and tailored pet care in ${servedAreas}.`}
        />
        <meta property="og:image" content={heroImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Ruh-Roh Retreat" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${sitter.name} | ${sitter.tagline}`} />
        <meta
          name="twitter:description"
          content={`Book ${sitter.name} for boutique boarding with transparent reviews, badge achievements, and tailored pet care in ${servedAreas}.`}
        />
        <meta name="twitter:image" content={heroImage} />
        <link rel="canonical" href={canonicalUrl} />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(sitterSchema),
        }}
      />
      <Footer />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = sitters.map((sitter) => ({ params: { id: sitter.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<SitterPageProps> = ({ params }) => {
  const id = params?.id;
  if (typeof id !== "string") {
    return { notFound: true };
  }

  const sitter = getSitterById(id);

  if (!sitter) {
    return { notFound: true };
  }

  let gallery: SitterGalleryPhoto[] = [];
  const galleryDir = path.join(process.cwd(), "public", "sitters", sitter.uid, "gallery");
  try {
    if (fs.existsSync(galleryDir)) {
      const files = fs.readdirSync(galleryDir);
      gallery = files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => ({
          src: `/sitters/${sitter.uid}/gallery/${file}`,
          alt: file.replace(/\.[^/.]+$/, "").replace(/-/g, " "),
        }));
    }
  } catch (error) {
    console.error(`Error loading gallery for sitter ${sitter.id}:`, error);
  }

  const sitterWithGallery: Sitter = {
    ...sitter,
    gallery,
  };

  return {
    props: {
      sitter: sitterWithGallery,
    },
  };
};

export default SitterPage;
