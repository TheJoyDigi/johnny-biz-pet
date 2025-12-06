import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaTimes, FaQuestionCircle } from "react-icons/fa";
import { useState, useEffect } from "react"; // Merged
import { motion, AnimatePresence } from "framer-motion";
import { GetStaticProps } from "next";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Sitter, SitterBadge } from "@/data/sitters";
import { BADGE_DEFINITIONS, BadgeDefinition } from "@/constants/badges";
import { fetchSittersFromDb } from "@/lib/sitters-db";
import { createClient } from "@supabase/supabase-js";
import SitterSearch from "@/components/sitters/SitterSearch";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOTAL_BADGES = Object.keys(BADGE_DEFINITIONS).length;

type BadgeWithDef = SitterBadge & { definition: BadgeDefinition | undefined };

interface SittersPageProps {
  sitters: Sitter[];
}

function SittersPage({ sitters: initialSitters }: SittersPageProps) {
  const [filteredSitters, setFilteredSitters] = useState<Sitter[]>(initialSitters);
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithDef | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Re-hydrate initial sitters if prop changes (not common in static props but good practice)
  useEffect(() => {
    setFilteredSitters(initialSitters);
  }, [initialSitters]);

  const handleSearch = async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
        const { data: nearbySitters, error } = await supabase.rpc('search_sitters_nearby', {
            user_lat: lat,
            user_lng: lng,
            radius_meters: 50000 // 50km
        });

        if (error) {
            console.error("Search error:", error);
            // Fallback? or Alert?
            return;
        }

        if (nearbySitters) {
            // Filter the initialSitters list to only include those returned by search.
            // Note: initialSitters uses 'slug' as the 'id' property if it exists.
            // The RPC returns { id, slug, dist_meters ... }.
            
            // We use (slug || id) as the common key
            const nearbyKeys = new Set(nearbySitters.map((ns: any) => ns.slug || ns.id));
            
            // Create a map of key -> distance for sorting
            const distanceMap = new Map(nearbySitters.map((ns: any) => [ns.slug || ns.id, ns.dist_meters]));

            const filtered = initialSitters
                .filter(s => nearbyKeys.has(s.id))
                .sort((a, b) => {
                    const distA = Number(distanceMap.get(a.id)) || 0;
                    const distB = Number(distanceMap.get(b.id)) || 0;
                    return distA - distB;
                });

            setFilteredSitters(filtered);
        }
    } catch (e) {
        console.error("Search exception:", e);
    } finally {
        setIsSearching(false);
    }
  };

  return (
    <>
      <Head>
        <title>Meet Available Sitters | Ruh-Roh Retreat</title>
        <meta name="description" content="Browse verified Ruh-Roh Retreat sitters in Irvine and Wildomar." />
      </Head>
      <Header />
      <main className="bg-[#F4F4F9] min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="uppercase tracking-widest text-sm font-semibold text-[#1A9CB0]">Meet Available Sitters</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mt-4">Curated hosts for boutique dog vacations</h1>
            <p className="text-lg text-gray-600 mt-4">
              Every Ruh-Roh sitter earns badges for communication, stability, and spotless home environments. Compare locations
              below and open a profile to explore bios, services, and verified reviews.
            </p>
          </div>

          <SitterSearch onSearch={handleSearch} isLoading={isSearching} />

          {filteredSitters.length === 0 ? (
             <div className="text-center py-12">
                <p className="text-xl text-gray-500">No sitters found in this area yet.</p>
                <button 
                    onClick={() => setFilteredSitters(initialSitters)}
                    className="mt-4 text-[#1A9CB0] underline hover:text-[#157c8d]"
                >
                    View all sitters
                </button>
             </div>
          ) : (
             <div className="grid gap-8 md:grid-cols-2">
            {filteredSitters.map((sitter) => {
              const reviews = sitter.reviews ?? [];
              const totalStars = reviews.reduce((sum, review) => sum + review.rating, 0);
              const reviewsCount = reviews.length;
              const averageRating = reviewsCount === 0 ? null : totalStars / reviewsCount;

              const earnedBadgesCount = sitter.badges.filter((b) => b.earned).length;
              const totalBadges = TOTAL_BADGES;
              const isGoldStandard = earnedBadgesCount === totalBadges;
              const goldStandardBadge = sitter.badges.find((b) => b.key === "gold-standard");
              const goldStandardDef = goldStandardBadge ? BADGE_DEFINITIONS[goldStandardBadge.key] : undefined;

              return (
                <article
                  key={sitter.id}
                  className={`bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col ${
                    isGoldStandard ? "border-4 border-[#FFD700] relative" : ""
                  }`}
                >
                  {isGoldStandard && (
                    <div className="absolute top-4 right-4 z-10 bg-[#FFD700] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                      Gold Standard
                    </div>
                  )}
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
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Badges</h3>
                        <Link href="/badges" title="What is the badge system?" className="text-gray-400 hover:text-[#1A9CB0] transition-colors">
                          <FaQuestionCircle className="w-4 h-4" />
                        </Link>
                      </div>
                      <div className="mt-2">
                        {isGoldStandard && goldStandardBadge && goldStandardDef ? (
                          <button
                            type="button"
                            onClick={() => setSelectedBadge({ ...goldStandardBadge, definition: goldStandardDef })}
                            className="flex items-center gap-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FDB931]/10 p-3 rounded-xl border border-[#FFD700]/30 w-full hover:bg-[#FFD700]/20 transition-colors text-left"
                          >
                            <div className="relative h-12 w-12 flex-shrink-0">
                              <Image
                                src={goldStandardDef.imageSrc}
                                alt={goldStandardBadge.title}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-[#333333] text-sm">Ruh-Roh Gold Standard</p>
                              <p className="text-xs text-gray-600">All 8 badges earned!</p>
                            </div>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1A9CB0] rounded-full"
                                style={{ width: `${(earnedBadgesCount / totalBadges) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                              {earnedBadgesCount}/{totalBadges} Earned
                            </span>
                          </div>
                        )}
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
                        href={{
                          pathname: "/book",
                          query: { sitter: sitter.id }, // Changed from uid to id for consistency with fetchSittersFromDb slug
                        }}
                        className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#1A9CB0] text-white font-semibold hover:bg-[#157c8d] transition-colors"
                      >
                        Request to Book
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          )}
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

export const getStaticProps: GetStaticProps<SittersPageProps> = async () => {
  const sitters = await fetchSittersFromDb();
  return {
    props: {
      sitters,
    },
    revalidate: 60, // Revalidate every 1 minute
  };
};

export default SittersPage;
