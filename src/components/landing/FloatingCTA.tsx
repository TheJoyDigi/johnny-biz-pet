import { useEffect, useState, RefObject } from "react";
import Link from "next/link";
import { FaPaw, FaCalendarCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

type FloatingCTAProps = {
  heroRef?: RefObject<HTMLElement>;
};

export default function FloatingCTA({ heroRef }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let shouldShow = true;

      // Check if we are at the hero section (if heroRef is provided)
      if (heroRef?.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        // If the bottom of the hero is still in the viewport (positive value), 
        // or we are very close to the top, don't show.
        // We want to show only after scrolling PAST the hero.
        if (heroRect.bottom > 100) {
          shouldShow = false;
        }
      }

      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroRef]);

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
              className="flex items-center justify-center w-14 h-14 bg-white text-[#1A9CB0] rounded-full shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 border border-[#1A9CB0]/20 group relative"
              aria-label="Find Sitter"
            >
              <FaPaw className="text-xl" />
              <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Find Sitter
              </span>
            </Link>
            <Link
              href="/book"
              className="flex items-center justify-center w-14 h-14 bg-[#1A9CB0] text-white rounded-full shadow-lg hover:bg-[#147384] hover:scale-105 transition-all duration-300 group relative"
              aria-label="Book Now"
            >
              <FaCalendarCheck className="text-xl" />
              <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Submit a Request
              </span>
            </Link>
          </motion.div>

          {/* Mobile View: Bottom Sticky Bar */}
          <motion.div
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 px-4 py-3 flex gap-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/sitters"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#1A9CB0] text-[#1A9CB0] font-semibold py-3 rounded-full shadow-sm active:bg-gray-50"
            >
              <FaPaw />
              Find Sitter
            </Link>
            <Link
              href="/book"
              className="flex-1 flex items-center justify-center gap-2 bg-[#1A9CB0] text-white font-semibold py-3 rounded-full shadow-md active:bg-[#147384]"
            >
              <FaCalendarCheck />
              Submit a Request
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
