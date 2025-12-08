import Head from "next/head";

const SITE_URL = "https://www.ruhrohretreat.com";
const SOCIAL_IMAGE = `${SITE_URL}/hero/landing-hero.png`;
const META_TITLE = "Ruh-Roh Retreat | Boutique In-Home Dog Sitting in Irvine & Wildomar";
const META_DESCRIPTION =
  "Boutique in-home dog sitting powered by Badge-Rated sitters who deliver calm, structured care, daily updates, and vacation-style add-ons throughout Irvine and Wildomar.";

export const DefaultMetaData = () => (
  <Head>
    <title key="title">{META_TITLE}</title>
    <meta key="description" name="description" content={META_DESCRIPTION} />
    <meta
      name="keywords"
      content="boutique dog boarding, Irvine dog sitter, Wildomar dog boarding, badge-rated sitters, calm dog care, structured dog daycare, Ruh-Roh Retreat, luxury dog add-ons"
    />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Ruh-Roh Retreat" />
    <link rel="canonical" href={SITE_URL} />

    {/* Twitter Card Metadata */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta key="twitter:title" name="twitter:title" content={META_TITLE} />
    <meta key="twitter:description" name="twitter:description" content={META_DESCRIPTION} />
    <meta key="twitter:image" name="twitter:image" content={SOCIAL_IMAGE} />
    <meta name="twitter:site" content="@ruhrohretreat" />

    {/* Open Graph Metadata */}
    <meta key="og:title" property="og:title" content={META_TITLE} />
    <meta key="og:description" property="og:description" content={META_DESCRIPTION} />
    <meta key="og:image" property="og:image" content={SOCIAL_IMAGE} />
    <meta key="og:type" property="og:type" content="website" />
    <meta key="og:url" property="og:url" content={SITE_URL} />
    <meta property="og:site_name" content="Ruh-Roh Retreat" />
    <meta property="og:locale" content="en_US" />

    {/* Schema.org structured data for local business */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${SITE_URL}#ruh-roh-retreat`,
          name: "Ruh-Roh Retreat",
          description: META_DESCRIPTION,
          image: SOCIAL_IMAGE,
          url: SITE_URL,
          telephone: "+17143294534",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "13212 Telmo",
            addressLocality: "Irvine",
            addressRegion: "CA",
            postalCode: "92618",
            addressCountry: "US",
          },
          areaServed: ["Irvine CA", "Wildomar CA", "Orange County", "Temecula Valley"],
          geo: {
            "@type": "GeoCoordinates",
            latitude: 33.6583,
            longitude: -117.7384,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "07:00",
              closes: "21:00",
            },
          ],
          makesOffer: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Boutique Dog Boarding",
                serviceType: "In-home overnight care with calm, small-group environments",
                areaServed: ["Irvine CA", "Wildomar CA"],
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Doggy Daycare",
                serviceType: "Structured daytime care with enrichment activities",
                areaServed: ["Irvine CA", "Wildomar CA"],
              },
            },
          ],
          sameAs: [
            "https://www.facebook.com/ruhrohretreat",
            "https://www.instagram.com/ruhrohretreat",
          ],
        }),
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
    ? `https://www.ruhrohretreat.com/posts/${slug}/cover.jpg`
    : "https://www.ruhrohretreat.com/hero/landing-hero.png";

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
        content={`https://www.ruhrohretreat.com/blog/${slug}`}
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

      {/* Additional SEO Meta Tags */}
      <meta
        name="keywords"
        content="pet care, pet boarding, dog boarding, cat boarding, luxury pet care, ${title.toLowerCase()}"
      />
      <meta name="robots" content="index, follow" />
      <link
        rel="canonical"
        href={`https://www.ruhrohretreat.com/blog/${slug}`}
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
                url: "https://www.ruhrohretreat.com/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://www.ruhrohretreat.com/blog/${slug}`,
            },
          }),
        }}
      />
    </Head>
  );
}
