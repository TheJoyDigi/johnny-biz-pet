import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaStar } from "react-icons/fa";

import { Sitter, SitterReview } from "@/data/sitters";
import { getHighlightedTestimonialsForSitter } from "@/data/testimonials";
import PhotoGallerySection from "../landing/PhotoGallerySection";
import { Photo } from "../photo-gallery";
import { BADGE_DEFINITIONS } from "@/constants/badges";

type SitterDetailProps = {
  sitter: Sitter;
};

const SitterDetail = ({ sitter }: SitterDetailProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllHighlighted, setShowAllHighlighted] = useState(false);
  const sitterUid = sitter.uid;
  const baseReviews = sitter.reviews ?? [];
  const highlightedReviews = getHighlightedTestimonialsForSitter(sitterUid);
  const signature = (review: { client: string; date: string; text: string }) =>
    `${review.client}-${review.date}-${review.text}`;
  const highlightedSignatures = new Set(highlightedReviews.map(signature));
  const remainingReviews = baseReviews.filter(
    (review) => !highlightedSignatures.has(signature(review))
  );
  const orderedReviews = [...highlightedReviews, ...remainingReviews];

  const initiallyVisibleHighlighted = highlightedReviews.slice(0, 5);

  const reviewsToDisplay = showAllReviews
    ? orderedReviews
    : showAllHighlighted
    ? highlightedReviews
    : initiallyVisibleHighlighted.length > 0
    ? initiallyVisibleHighlighted
    : orderedReviews.slice(0, 1);

  const canShowMoreHighlighted = highlightedReviews.length > 5 && !showAllHighlighted && !showAllReviews;
  const canShowAllReviews = orderedReviews.length > reviewsToDisplay.length && !showAllReviews;
  const galleryPhotos: Photo[] =
    sitter.gallery?.map((photo, index) => ({
      id: `${sitter.id}-gallery-${index}`,
      src: photo.src,
      alt: photo.alt,
      width: photo.width ?? 1200,
      height: photo.height ?? 800,
    })) ?? [];
  const addOnCategories = sitter.services.addOns ?? [];
  const [openServices, setOpenServices] = useState<Record<string, boolean>>({});
  const renderReviewAvatar = (review: SitterReview) =>
    review.image ? (
      <Image
        src={review.image}
        alt={`${review.client}'s pet`}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
    ) : (
      <div className="h-12 w-12 rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] flex items-center justify-center font-semibold">
        {review.client.charAt(0)}
      </div>
    );

  const toggleService = (name: string) => {
    setOpenServices((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden max-w-5xl mx-auto">
      <div className="relative w-full h-52 sm:h-72 md:h-96">
        <Image
          src={sitter.heroImage}
          alt={`${sitter.name}'s home environment`}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-6 sm:p-8 lg:p-12 space-y-8 sm:space-y-10">
        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full ring-4 ring-white shadow-lg overflow-hidden">
                <Image
                  src={sitter.avatar || sitter.heroImage}
                  alt={`${sitter.name} avatar`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#333333]">{sitter.name}</h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1">{sitter.tagline}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] text-xs sm:text-sm font-semibold">
                {sitter.locations.map((location) => `${location.city}, ${location.state}`).join(" • ")}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {sitter.bio.map((paragraph, index) => (
              <p key={`${sitter.id}-bio-${index}`} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-[#333333] mb-3">Home Environment</h2>
              <ul className="space-y-2 text-gray-700 list-disc list-inside">
                {sitter.homeEnvironment.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#333333] mb-3">Ruh-Roh Badges</h2>
              <div className="space-y-3">
                {sitter.badges
                  .filter((badge) => badge.earned)
                  .map((badge, badgeIndex) => {
                  const badgeDef = BADGE_DEFINITIONS[badge.key];
                  return (
                    <div
                      key={`${sitter.id}-badge-${badge.key}-${badgeIndex}`}
                      className="flex items-start gap-3"
                    >
                      <div
                        className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full overflow-hidden"
                        aria-hidden="true"
                      >
                        {badgeDef?.imageSrc && (
                          <Image
                            src={badgeDef.imageSrc}
                            alt={badge.title}
                            width={50}
                            height={50}
                            className="object-cover rounded-full"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#333333]">
                          {badge.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#333333] mb-3">Services & Add-ons</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tap to explore core services or browse optional upgrades offered by this sitter.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-[#333333] mb-3">Primary Services</h3>
                <div className="space-y-3">
                  {sitter.services.primary.map((service, index) => {
                    const serviceId = `${sitter.id}-service-${index}`;
                    const isOpen = openServices[service.name];
                    return (
                      <div key={serviceId} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`${serviceId}-content`}
                          onClick={() => toggleService(service.name)}
                          className="w-full px-4 py-3 text-left"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <span className="font-semibold text-[#333333]">{service.name}</span>
                              {service.price && (
                                <span className="block text-sm text-[#1A9CB0] font-semibold sm:hidden mt-1">
                                  {service.price}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 ml-auto">
                              {service.price && (
                                <span className="hidden sm:inline text-sm text-[#1A9CB0] font-semibold">
                                  {service.price}
                                </span>
                              )}
                              <FaChevronDown
                                className={`h-4 w-4 text-[#1A9CB0] transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        </button>
                        {isOpen && (
                          <p
                            id={`${serviceId}-content`}
                            className="px-4 pb-4 text-sm text-gray-600 leading-relaxed"
                          >
                            {service.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {addOnCategories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-3">Vacation-Style Add-ons</h3>
                  <div className="space-y-4">
                    {addOnCategories.map(({ category, items }) => (
                      <div key={`${sitter.id}-${category}`} className="rounded-2xl bg-[#F4F4F9] p-4 border border-gray-200">
                        <p className="text-sm uppercase tracking-wide text-[#1A9CB0] font-semibold mb-2">
                          {category}
                        </p>
                        <ul className="space-y-2">
                          {items.map((addon) => (
                            <li key={`${category}-${addon.name}`} className="flex flex-wrap justify-between text-sm text-gray-700">
                              <span className="font-medium text-[#333333]">{addon.name}</span>
                              {addon.price && <span className="text-[#F28C38] font-semibold">{addon.price}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {galleryPhotos.length > 0 && (
            <PhotoGallerySection
              photos={galleryPhotos}
              title={`Inside ${sitter.name}'s Retreat`}
              description={`A peek at daily life with ${sitter.name} in ${sitter.locations[0]?.city ?? "our homes"}.`}
              variant="profile"
            />
          )}

          <div>
            <h2 className="text-xl font-semibold text-[#333333] mb-3">Verified Reviews</h2>
            {orderedReviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Check back soon!</p>
            ) : (
              <div className="space-y-4">
                {reviewsToDisplay.map((review, reviewIndex) => (
                  <div key={`${review.id}-${reviewIndex}`} className="rounded-2xl bg-[#F4F4F9] p-4 border border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {renderReviewAvatar(review)}
                        <div>
                          <p className="font-semibold text-[#333333]">{review.client}</p>
                          <p className="text-sm text-gray-500">{`Pet: ${review.pet}`}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 ml-auto">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#F6C343] mt-2" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: review.rating }).map((_, starIndex) => (
                        <FaStar key={`${review.id}-star-${starIndex}`} className="h-4 w-4" />
                      ))}
                    </div>
                    <p className="mt-2 text-gray-700 italic">{review.text}</p>
                  </div>
                ))}
                <div className="flex flex-wrap gap-4">
                  {canShowMoreHighlighted && (
                    <button
                      onClick={() => setShowAllHighlighted(true)}
                      className="text-[#1A9CB0] font-semibold hover:underline"
                    >
                      View {highlightedReviews.length - 5} more highlighted reviews
                    </button>
                  )}
                  {canShowAllReviews && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="text-[#1A9CB0] font-semibold hover:underline"
                    >
                      View all {orderedReviews.length} reviews
                    </button>
                  )}
                  {showAllReviews && (
                     <button
                      onClick={() => {
                        setShowAllReviews(false);
                        setShowAllHighlighted(false);
                      }}
                      className="text-[#1A9CB0] font-semibold hover:underline"
                    >
                      Show less
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">

            <div className="sm:ml-auto flex flex-wrap gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <Link
                href={{
                  pathname: "/",
                  hash: "booking",
                  query: { sitter: sitter.uid },
                }}
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#F28C38] text-white font-semibold hover:bg-[#e07a26] transition-colors"
              >
                Book with {sitter.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SitterDetail;
