import { useEffect, useState, RefObject } from "react";
import Link from "next/link";
import { FaPaw } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

type FloatingCTAProps = {
  heroRef?: RefObject<HTMLElement>;
  ctaRef?: RefObject<HTMLElement>;
};

export default function FloatingCTA({ heroRef, ctaRef }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let shouldShow = true;

      // 1. Check if we are past the hero section (if heroRef is provided)
      if (heroRef?.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        // If the bottom of the hero is still in the viewport (positive value), 
        // or we are very close to the top, don't show.
        // We want to show only after scrolling PAST the hero.
        if (heroRect.bottom > 100) {
          shouldShow = false;
        }
      }

      // 2. Check if we reached the CTA section (if ctaRef is provided)
      if (ctaRef?.current) {
        const ctaRect = ctaRef.current.getBoundingClientRect();
        // If the top of the CTA section is visible in the viewport
        if (ctaRect.top < window.innerHeight) {
          shouldShow = false;
        }
      }

      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroRef, ctaRef]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Desktop View: Bottom Right Bubbles */}
          <motion.div
            className="hidden md:flex fixed bottom-8 right-8 flex-col gap-4 z-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/sitters"
              className="flex items-center justify-center w-14 h-14 bg-[#F28C38] text-white rounded-full shadow-lg hover:bg-[#e07a26] hover:scale-105 transition-all duration-300 group relative"
              aria-label="Find Your Perfect Sitter"
            >
              <FaPaw className="text-xl" />
              <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Find Your Perfect Sitter
              </span>
            </Link>
          </motion.div>

          {/* Mobile View: Bottom Sticky Bar */}
          <motion.div
            className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-auto"
            initial={{ y: "150%", x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            exit={{ y: "150%", x: "-50%" }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/sitters"
              className="flex items-center justify-center gap-2 bg-[#F28C38] text-white font-bold py-3 px-8 rounded-full shadow-xl hover:bg-[#e07a26] active:scale-95 transition-all whitespace-nowrap"
            >
              <FaPaw />
              Find Your Perfect Sitter
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
