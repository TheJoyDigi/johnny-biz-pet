import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaStar, FaQuestionCircle } from "react-icons/fa";

import { Sitter, SitterReview } from "@/data/sitters";
import { Photo } from "../photo-gallery";
import { BADGE_DEFINITIONS } from "@/constants/badges";
import ReviewsDialog from "./ReviewsDialog";
import SitterGallery from "./SitterGallery";

type SitterDetailProps = {
  sitter: Sitter;
};

const SitterDetail = ({ sitter }: SitterDetailProps) => {
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showAllAddons, setShowAllAddons] = useState(false);
  
  const reviews = sitter.reviews ?? [];
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalReviews = sortedReviews.length;
  const averageRating = totalReviews > 0
      ? (sortedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : "New";

  const reviewsToDisplay = sortedReviews.slice(0, 5);
  const canShowAllReviews = sortedReviews.length > reviewsToDisplay.length;
  
  const galleryPhotos: Photo[] = sitter.gallery?.map((photo, index) => ({
      id: `${sitter.id}-gallery-${index}`,
      src: photo.src,
      alt: photo.alt,
      width: photo.width ?? 1200,
      height: photo.height ?? 800,
    })) ?? [];

  const addOnCategories = sitter.services.addOns ?? [];
  const allAddonsFlat = addOnCategories.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })));

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const AccordionItem = ({ title, children, id }: { title: string, children: React.ReactNode, id: string }) => (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-lg text-[#333333]">{title}</span>
        <FaChevronDown className={`transform transition-transform duration-200 ${openSections[id] ? "rotate-180" : ""}`} />
      </button>
      {openSections[id] && <div className="p-4 bg-white border-t border-gray-100">{children}</div>}
    </div>
  );

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden max-w-5xl mx-auto">
      {/* Hero Image */}
      <div className="relative w-full h-52 sm:h-72 md:h-96">
        <Image
          src={sitter.heroImage}
          alt={`${sitter.name}'s home environment`}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="p-6 sm:p-8 lg:p-12 space-y-10">
        {/* Header Info */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
            <div className="flex flex-col items-start md:items-end gap-2">
              {totalReviews > 0 && (
                <div className="flex items-center gap-1.5">
                  <FaStar className="h-5 w-5 text-[#F6C343]" />
                  <span className="text-xl font-bold text-[#333333]">{averageRating}</span>
                  <span className="text-gray-500 font-medium">({totalReviews})</span>
                </div>
              )}
              <span className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] text-xs sm:text-sm font-semibold">
                {sitter.locations.map((location) => `${location.city}, ${location.state}`).join(" • ")}
              </span>
            </div>
        </div>

        {/* Bio Intro */}
        <div className="space-y-4">
            {sitter.bio.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed">{paragraph}</p>
            ))}
        </div>

        {/* Photo Gallery (Moved here) */}
        {galleryPhotos.length > 0 && (
            <SitterGallery
                photos={galleryPhotos}
                title={`Inside ${sitter.name}'s Retreat`}
            />
        )}

        {/* Badges & Pricing Grid */}
        <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Badges */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold text-[#333333]">Ruh-Roh Badges</h2>
                    <Link href="/badges" title="Learn about badges" className="text-gray-400 hover:text-[#1A9CB0] transition-colors">
                        <FaQuestionCircle />
                    </Link>
                </div>
                <div className="space-y-3">
                    {sitter.badges.filter((badge) => badge.earned).map((badge, index) => {
                        const badgeDef = BADGE_DEFINITIONS[badge.key];
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full overflow-hidden">
                                    {badgeDef?.imageSrc && (
                                        <Image src={badgeDef.imageSrc} alt={badge.title} width={50} height={50} className="object-cover rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-[#333333]">{badge.title}</p>
                                    <p className="text-sm text-gray-600">{badge.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Pricing & Discounts */}
            <div>
                <h2 className="text-xl font-semibold text-[#333333] mb-4">Pricing & Discounts</h2>
                <div className="space-y-4">
                    {/* Primary Services */}
                    <div className="bg-[#F4F4F9] rounded-2xl p-5 border border-gray-200">
                        <h3 className="text-sm font-semibold text-[#1A9CB0] uppercase tracking-wide mb-3">Services</h3>
                        <ul className="space-y-3">
                            {sitter.services.primary.map((service, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-[#333333]">{service.name}</span>
                                    <span className="font-bold text-[#F28C38]">{service.price}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Discounts */}
                    {sitter.discounts && (
                        <div className="bg-[#F4F4F9] rounded-2xl p-5 border border-gray-200">
                            <h3 className="text-sm font-semibold text-[#1A9CB0] uppercase tracking-wide mb-3">Discounts</h3>
                            <div className="space-y-4">
                                {sitter.discounts.lengthOfStay && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-1">Length of Stay</p>
                                        <ul className="space-y-1">
                                            {sitter.discounts.lengthOfStay.map((d, i) => (
                                                <li key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{d.label}</span>
                                                    <span className="font-semibold text-[#333333]">{d.detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {sitter.discounts.referral && (
                                     <div>
                                        <p className="text-xs font-bold text-gray-500 mb-1">Referral</p>
                                        <ul className="space-y-1">
                                            {sitter.discounts.referral.map((d, i) => (
                                                <li key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{d.label}</span>
                                                    <span className="font-semibold text-[#333333]">{d.detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4">
            {sitter.careStyle && sitter.careStyle.length > 0 && (
                <AccordionItem title="My Care Style" id="careStyle">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {sitter.careStyle.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </AccordionItem>
            )}

            {sitter.parentExpectations && sitter.parentExpectations.length > 0 && (
                <AccordionItem title="What Pet Parents Can Expect" id="expect">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {sitter.parentExpectations.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </AccordionItem>
            )}

            {sitter.homeEnvironment && (
                <AccordionItem title="Home Environment" id="home">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {sitter.homeEnvironment.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </AccordionItem>
            )}

            {sitter.skills && (
                <AccordionItem title="Skills" id="skills">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {sitter.skills.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </AccordionItem>
            )}
        </div>

        {/* Vacation Style Add-ons */}
        {allAddonsFlat.length > 0 && (
            <div>
                <h2 className="text-xl font-semibold text-[#333333] mb-4">Vacation-Style Add-ons</h2>
                <div className="bg-[#F4F4F9] rounded-2xl p-6 border border-gray-200">
                    {!showAllAddons ? (
                        <ul className="space-y-3">
                            {allAddonsFlat.slice(0, 5).map((addon, index) => (
                                <li key={index} className="flex justify-between items-center text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                    <div>
                                        <span className="font-medium text-[#333333] block">{addon.name}</span>
                                        {addon.description && <span className="text-xs text-gray-500">{addon.description}</span>}
                                    </div>
                                    {addon.price && <span className="font-bold text-[#F28C38]">{addon.price}</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="space-y-6">
                            {addOnCategories.map((cat, i) => (
                                <div key={i}>
                                    <h3 className="text-sm font-bold text-[#1A9CB0] uppercase tracking-wide mb-3">{cat.category}</h3>
                                    <ul className="space-y-3">
                                        {cat.items.map((addon, j) => (
                                            <li key={j} className="flex justify-between items-center text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                                <div>
                                                    <span className="font-medium text-[#333333] block">{addon.name}</span>
                                                    {addon.description && <span className="text-xs text-gray-500">{addon.description}</span>}
                                                </div>
                                                {addon.price && <span className="font-bold text-[#F28C38]">{addon.price}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {allAddonsFlat.length > 5 && (
                        <button 
                            onClick={() => setShowAllAddons(!showAllAddons)}
                            className="mt-4 w-full py-2 text-center text-[#1A9CB0] font-semibold hover:bg-[#1A9CB0]/10 rounded-lg transition-colors"
                        >
                            {showAllAddons ? "Show Less" : "See More Add-ons"}
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* Reviews Section */}
        <div>
            <h2 className="text-xl font-semibold text-[#333333] mb-3">Verified Reviews</h2>
            {sortedReviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet. Check back soon!</p>
            ) : (
              <div className="space-y-4">
                {reviewsToDisplay.map((review, reviewIndex) => (
                  <div key={`${review.id}-${reviewIndex}`} className="rounded-2xl bg-[#F4F4F9] p-4 border border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1A9CB0]/10 flex items-center justify-center text-[#1A9CB0] font-bold text-lg flex-shrink-0">
                          {review.client.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#333333]">{review.client}</p>
                          {review.pet && <p className="text-sm text-gray-500">{review.pet}</p>}
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
                  {canShowAllReviews && (
                    <button
                      onClick={() => setIsReviewsDialogOpen(true)}
                      className="text-[#1A9CB0] font-semibold hover:underline"
                    >
                      View all {sortedReviews.length} reviews
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
            <Link
                href={{
                  pathname: "/book",
                  query: { sitter: sitter.uid },
                }}
                className="inline-flex items-center px-8 py-4 rounded-full bg-[#F28C38] text-white font-bold text-lg hover:bg-[#e07a26] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                Request to Book
            </Link>
        </div>

      </div>
      
      <ReviewsDialog 
        isOpen={isReviewsDialogOpen} 
        onClose={() => setIsReviewsDialogOpen(false)} 
        reviews={sortedReviews} 
      />
    </section>
  );
};

export default SitterDetail;
