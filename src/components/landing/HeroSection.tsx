import { motion, cubicBezier } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaEnvelope, FaPaw, FaGoogle, FaYelp } from "react-icons/fa";



const HERO_FADE_EASE = cubicBezier(0.4, 0, 0.2, 1);

function HeroSection() {
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
            src="/hero/landing-hero-v3.png"
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


          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-2 drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Boutique In-Home <br />
            Dog Sitting
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl font-light text-white/90 mb-6 drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
          >
            — Irvine & Wildomar, CA
          </motion.p>

          {/* Subheadline & Description */}
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Feel at ease while you’re away
          </motion.p>

          <motion.blockquote
            className="border-l-4 border-[#F28C38] pl-4 my-8 max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
          >
            <p className="text-lg text-white/90 italic mb-2">
              “We felt completely at-ease throughout our entire trip, which is priceless as a pet parent.”
            </p>
            <footer className="text-white/80 font-medium">— Martha P.</footer>
          </motion.blockquote>

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
              Find Your Perfect Sitter
            </Link>
          </motion.div>

          {/* Additional Trust Signal */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 text-white/80 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            <span>Trusted by local pet parents • Verified Reviews on:</span>
            <div className="flex gap-3">
              <a
                href="https://share.google/sDp4rVUlgWhyagpl7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <FaGoogle className="text-[#4285F4]" />
                <span className="font-bold text-gray-800">Google</span>
              </a>
              <a
                href="https://www.yelp.com/biz/ruh-roh-retreat-irvine"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <FaYelp className="text-[#FF1A1A]" />
                <span className="font-bold text-gray-800">Yelp</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
