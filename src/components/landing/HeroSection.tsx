import { motion, cubicBezier } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaEnvelope, FaPaw } from "react-icons/fa";

type HeroSectionProps = {
  onBookNow: () => void;
};

const HERO_FADE_EASE = cubicBezier(0.4, 0, 0.2, 1);

function HeroSection({ onBookNow }: HeroSectionProps) {
  return (
    <section className="relative h-[80vh] flex items-center">
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.2,
            ease: HERO_FADE_EASE,
          }}
          className="absolute inset-0"
        >
          <Image
            src="/hero/landing-hero.png"
            alt="Pet sitter playing with dogs"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.3 }}
            className="absolute inset-0 bg-black"
          />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-white flex flex-col justify-center items-center text-center pb-48">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.5 }}
          className="max-w-2xl"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.6 }}
          >
            Boutique In-Home Dog Sitting — Structured Care, Happy Tails
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-white/90"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.7 }}
          >
            Your dog deserves more than just care — they deserve a vacation.
          </motion.p>
          <motion.p
            className="text-lg md:text-xl mb-4 text-white/90"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.75 }}
          >
            Ruh-Roh Retreat connects pet parents with badge-verified sitters who share our boutique philosophy of structure,
            comfort, and personalized attention.
          </motion.p>
          <motion.p
            className="text-base md:text-lg mb-2 text-white/80 font-semibold"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.8 }}
          >
            ⭐⭐⭐⭐⭐ Founded by sitters with 95+ five-star reviews
          </motion.p>
          <motion.p
            className="text-base md:text-lg mb-8 text-white/80"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.85 }}
          >
            20+ reviews on Google & Yelp as Ruh-Roh Retreat
          </motion.p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent pt-8 pb-4">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-wrap gap-4 justify-center mb-8"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: HERO_FADE_EASE, delay: 0.8 }}
          >
            <Link
              href="/sitters"
              className="bg-[#F28C38] hover:bg-[#e07a26] text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300 inline-flex items-center gap-2"
            >
              <FaPaw className="h-5 w-5" aria-hidden="true" />
              Find a Sitter
            </Link>
            <button
              onClick={onBookNow}
              className="bg-transparent hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300 border-2 border-white/60 inline-flex items-center gap-2"
            >
              <FaEnvelope className="h-5 w-5" aria-hidden="true" />
              Submit a Request
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
