import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { sitters, SitterBadge } from "@/data/sitters";
import { BADGE_DEFINITIONS, BadgeDefinition } from "@/constants/badges";

function getAverageRating(reviewsLength: number, totalStars: number) {
  if (reviewsLength === 0) return null;
  return totalStars / reviewsLength;
}

type BadgeWithDef = SitterBadge & { definition: BadgeDefinition | undefined };

function SittersPage() {
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithDef | null>(null);

  return (
    <>
      <Head>
        <title>Meet Our Sitters | Ruh-Roh Retreat</title>
        <meta name="description" content="Browse verified Ruh-Roh Retreat sitters in Irvine and Wildomar." />
      </Head>
      <Header />
      <main className="bg-[#F4F4F9] min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="uppercase tracking-widest text-sm font-semibold text-[#1A9CB0]">Meet Our Sitters</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mt-4">Handpicked hosts for boutique dog vacations</h1>
            <p className="text-lg text-gray-600 mt-4">
              Every Ruh-Roh sitter earns badges for communication, stability, and spotless home environments. Compare locations
              below and open a profile to explore bios, services, and verified reviews.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {sitters.map((sitter) => {
              const totalStars = sitter.reviews.reduce((sum, review) => sum + review.rating, 0);
              const reviewsCount = sitter.reviews.length;
              const averageRating = getAverageRating(reviewsCount, totalStars);

              return (
                <article key={sitter.id} className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col">
                  <div className="relative h-56 w-full">
                    <Image src={sitter.heroImage} alt={`${sitter.name}'s home`} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-full ring-4 ring-white shadow-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={sitter.avatar || sitter.heroImage}
                            alt={`${sitter.name} avatar`}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[#333333]">{sitter.name}</h2>
                          <p className="text-sm text-gray-500">
                            {sitter.locations.map((location) => `${location.city}, ${location.state}`).join(" • ")}
                          </p>
                        </div>
                      </div>
                      {averageRating && (
                        <div className="flex items-center gap-1 text-[#F6C343]" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
                          <FaStar className="h-5 w-5" />
                          <span className="text-base font-semibold text-[#333333]">{averageRating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({reviewsCount})</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mt-3">{sitter.bio[0]}</p>

                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Badges</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {sitter.badges.map((badge) => {
                          const badgeDef = BADGE_DEFINITIONS[badge.key];
                          return (
                            <button
                              key={`${sitter.id}-${badge.key}`}
                              type="button"
                              onClick={() => setSelectedBadge({ ...badge, definition: badgeDef })}
                              className={`cursor-pointer transition-transform duration-200 hover:scale-110 ${
                                badge.earned
                                  ? "border-none"
                                  : "grayscale opacity-60"
                              }`}
                            >
                              {badgeDef?.imageSrc && (
                                <Image
                                  src={badgeDef.imageSrc}
                                  alt={badge.title}
                                  width={50}
                                  height={50}
                                  className="object-contain rounded-full"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                      <Link
                        href={`/sitters/${sitter.id}`}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#F28C38] text-white font-semibold hover:bg-[#e07a26] transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        href="/#booking"
                        className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#1A9CB0] text-white font-semibold hover:bg-[#157c8d] transition-colors"
                      >
                        Book This Sitter
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-auto p-8 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <FaTimes className="h-6 w-6" />
              </button>

              <div className="flex justify-center mb-4">
                <div
                  className={`flex items-center justify-center ${
                    selectedBadge.earned
                      ? ""
                      : "grayscale opacity-60"
                  }`}
                >
                  {selectedBadge.definition?.imageSrc && (
                    <Image
                      src={selectedBadge.definition.imageSrc}
                      alt={selectedBadge.title}
                      width={120}
                      height={120}
                      className="object-contain rounded-full"
                    />
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#333333]">{selectedBadge.title}</h3>
              <p className="text-gray-600 mt-2">{selectedBadge.definition?.description}</p>
              {!selectedBadge.earned && (
                <p className="mt-4 bg-yellow-100 text-yellow-800 font-semibold rounded-full px-4 py-1 inline-block">
                  In Progress
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

export default SittersPage;
