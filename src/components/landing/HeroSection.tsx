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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
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
            alt="Happy dog in a boutique home environment"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
          {/* Gradient Overlay: Darker on left for text readability, transparent on right to show the dog */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: HERO_FADE_EASE }}
          className="max-w-3xl"
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8"
          >
            <span className="text-[#F28C38]">★★★★★</span>
            <span>Founded by sitters with 95+ five-star reviews</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Boutique In-Home <br />
            <span className="text-[#F28C38]">Dog Sitting</span>
          </motion.h1>

          {/* Subhead & Description */}
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Structured care, happy tails. Your dog deserves more than just a sitter — they deserve a vacation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link
              href="/sitters"
              className="bg-[#F28C38] hover:bg-[#e07a26] text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FaPaw className="h-5 w-5" aria-hidden="true" />
              Find a Sitter
            </Link>
            <button
              onClick={onBookNow}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 border border-white/30 inline-flex items-center gap-2"
            >
              <FaEnvelope className="h-5 w-5" aria-hidden="true" />
              Submit a Request
            </button>
          </motion.div>

          {/* Additional Trust Signal */}
          <motion.p
            className="mt-8 text-white/60 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            Trusted by local pet parents • Verified Reviews on Google & Yelp
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
