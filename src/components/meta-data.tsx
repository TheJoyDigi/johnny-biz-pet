import Head from "next/head";

export const SITE_URL = "https://www.ruhrohretreat.com";
export const SOCIAL_IMAGE_URL = `${SITE_URL}/ruhrohretreat-social.jpg`;

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Ruh-Roh Retreat",
  image: SOCIAL_IMAGE_URL,
  url: SITE_URL,
  telephone: "+17143294534",
  priceRange: "$$",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "13212 Telmo Way",
      addressLocality: "Irvine",
      addressRegion: "CA",
      postalCode: "92618",
      addressCountry: "US",
    },
    {
      "@type": "PostalAddress",
      addressLocality: "Wildomar",
      addressRegion: "CA",
      postalCode: "92595",
      addressCountry: "US",
    },
  ],
  areaServed: ["Irvine, CA", "Wildomar, CA", "South Orange County", "Temecula Valley"],
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.673033,
    longitude: -117.77879,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "21:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
  sameAs: [
    "https://www.facebook.com/ruhrohretreat",
    "https://www.instagram.com/ruhrohretreat",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      name: "Luxury Overnight Boarding",
      description:
        "In-home, boutique boarding with daily photo updates, enrichment walks, and structured routines tailored to each pet.",
      url: `${SITE_URL}/#booking`,
      areaServed: ["Irvine, CA", "Wildomar, CA"],
      availabilityEnds: "23:00",
    },
    {
      "@type": "Offer",
      name: "Spa Bath Experience",
      description: "Add-on spa baths to send pets home fresh and clean.",
      url: `${SITE_URL}/#vacation-add-ons`,
    },
    {
      "@type": "Offer",
      name: "Special Care Package",
      description: "Medication support and tailored attention for seniors or pets with medical needs.",
      url: `${SITE_URL}/#vacation-add-ons`,
    },
    {
      "@type": "Offer",
      name: "Premium Play Sessions",
      description: "Extra one-on-one playtime and enrichment for high-energy pets.",
      url: `${SITE_URL}/#vacation-add-ons`,
    },
  ],
};

export const DefaultMetaData = () => (
  <Head>
    <title>Ruh-Roh Retreat | Boutique In-Home Pet Boarding in Irvine & Wildomar</title>
    <meta
      name="description"
      content="Boutique overnight pet boarding with sitter badges, daily photo updates, and premium add-ons across Irvine and Wildomar. Safe, loving stays tailored to your dog or cat."
    />
    <meta
      name="keywords"
      content="Irvine dog boarding, Wildomar pet sitter, overnight pet boarding, boutique pet boarding, cat boarding, dog sitter with photo updates"
    />

    {/* Twitter Card Metadata */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta
      name="twitter:title"
      content="Ruh-Roh Retreat | Boutique In-Home Pet Boarding in Irvine & Wildomar"
    />
    <meta
      name="twitter:description"
      content="Boutique overnight pet boarding with sitter badges, daily photo updates, and premium add-ons across Irvine and Wildomar. Safe, loving stays tailored to your dog or cat."
    />
    <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
    <meta name="twitter:site" content="@ruhrohretreat" />

    {/* Open Graph Metadata */}
    <meta
      property="og:title"
      content="Ruh-Roh Retreat | Boutique In-Home Pet Boarding in Irvine & Wildomar"
    />
    <meta
      property="og:description"
      content="Boutique overnight pet boarding with sitter badges, daily photo updates, and premium add-ons across Irvine and Wildomar. Safe, loving stays tailored to your dog or cat."
    />
    <meta property="og:image" content={SOCIAL_IMAGE_URL} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Ruh-Roh Retreat" />
    <meta property="og:url" content={SITE_URL} />

    {/* Schema.org structured data for local business */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA),
      }}
    />
  </Head>
);

type BlogPostMetaDataProps = {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
  hasCoverImage: boolean;
};

export function BlogPostMetaData({
  title,
  description,
  date,
  author,
  slug,
  hasCoverImage,
}: BlogPostMetaDataProps) {
  const imageUrl = hasCoverImage
    ? `${SITE_URL}/posts/${slug}/cover.jpg`
    : SOCIAL_IMAGE_URL;

  const fullTitle = `${title} - Ruh-Roh Retreat Blog`;
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <meta property="article:published_time" content={date} />
      <meta property="article:author" content={author} />
      <meta property="article:section" content="Pet Care Blog" />
      <meta
        property="article:tag"
        content="pet care, pet boarding, dog boarding, cat boarding, luxury pet care"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta
        property="og:url"
        content={`${SITE_URL}/blog/${slug}`}
      />
      <meta property="og:site_name" content="Ruh-Roh Retreat" />
      <meta property="article:published_time" content={date} />
      <meta property="article:author" content={author} />
      <meta property="article:section" content="Pet Care Blog" />
      <meta
        property="article:tag"
        content="pet care, pet boarding, dog boarding, cat boarding, luxury pet care"
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content="@ruhrohretreat" />
      <meta name="twitter:site" content="@ruhrohretreat" />

      {/* Additional SEO Meta Tags */}
      <meta
        name="keywords"
        content={`pet care, pet boarding, dog boarding, cat boarding, luxury pet care, ${title.toLowerCase()}`}
      />
      <meta name="robots" content="index, follow" />
      <link
        rel="canonical"
        href={`${SITE_URL}/blog/${slug}`}
      />

      {/* Schema.org markup for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description: description,
            image: imageUrl,
            datePublished: date,
            dateModified: date,
            author: {
              "@type": "Person",
              name: author,
            },
            publisher: {
              "@type": "Organization",
              name: "Ruh-Roh Retreat",
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/logo.png`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog/${slug}`,
            },
          }),
        }}
      />
    </Head>
  );
}
