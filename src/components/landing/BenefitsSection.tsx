import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaShieldAlt, FaCamera, FaPalette, FaChevronDown } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

import { IconType } from "react-icons";

interface Pillar {
  title: string;
  description: string;
  detail: string;
  icon: IconType;
  accentBorder: string;
  accentText: string;
  imageSrc: string;
  link?: string;
  linkText?: string;
  footer?: string;
}

const pillars: Pillar[] = [
  {
    title: "Calm & Clean Environment",
    description: "A peaceful, well-kept space helps dogs feel grounded and secure.",
    detail: "Sitters who align with this pillar create calm, organized environments where safety and comfort come first.",
    icon: FaHome,
    accentBorder: "border-[#F28C38]",
    accentText: "text-[#F28C38]",
    imageSrc: "/images/calm-clean.png",
  },
  {
    title: "Structured & Safe",
    description: "Balance routines, predictable schedules, and low – stress introductions, help dogs feel secure and settle in comfortably.",
    detail: "Sitters who align with this pillar emphasize consistency and thoughtful transitions so each dog can adjust at their own pace and feel safe in their care.",
    icon: FaShieldAlt,
    accentBorder: "border-[#1A9CB0]",
    accentText: "text-[#1A9CB0]",
    imageSrc: "/images/structured-safe.png",
  },
  {
    title: "Transparent Communication",
    description: "Regular updates help you stay connected and confident, no matter where you are.",
    detail: "Updates can include photos, videos, or messages based on what works for you and your sitter. Many sitters also offer meet-and-greets before your trip.",
    icon: FaCamera,
    accentBorder: "border-[#6C63FF]",
    accentText: "text-[#6C63FF]",
    imageSrc: "/images/transparent-communication.png",
  },
  {
    title: "Personalized Vacations",
    description: "Every pup deserves a tailored experience.",
    detail: "Many sitters offer optional add-on activities—like Sniffaris, Paw-casso paintings, or pup cup outings—to make your dog’s stay feel like a true retreat.",
    icon: FaPalette,
    accentBorder: "border-[#E4572E]",
    accentText: "text-[#E4572E]",
    imageSrc: "/images/personalized-vacations.png",
    link: "/vacation-add-ons",
    linkText: "Explore Add-ons",
  },
];

function BenefitsSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="benefits" className="py-20 bg-[#F4F4F9]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">Why Pet Parents Choose Ruh-Roh Retreat</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our boutique ethos is built around four pillars inspired by comfort, care, and trust.
          </p>
        </div>

        <motion.p
          className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Each independent sitter in our network chooses to align with these values, helping pups feel safe, happy, and right at
          home. Our badge system helps you see which sitters consistently excel in each area.{" "}
          <Link href="/badges" className="text-[#1A9CB0] font-semibold hover:underline">
            Learn More →
          </Link>
        </motion.p>

        <div className="max-w-3xl mx-auto space-y-4">
          {pillars.map(({ title, description, detail, footer, icon: Icon, accentBorder, accentText, imageSrc, link, linkText }, index) => {
            const isOpen = expandedIndex === index;
            return (
              <motion.div
                key={title}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${accentBorder}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button
                  onClick={() => setExpandedIndex(isOpen ? null : index)}
                  className="w-full flex items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-xl ${accentText}`}>
                    <Icon aria-hidden="true" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-lg font-semibold text-[#333333]">{title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{description}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4 text-gray-400"
                  >
                    <FaChevronDown />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6">

                        <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6 shadow-md">
                          <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="text-gray-600 text-base leading-relaxed">{detail}</p>
                        {footer && <p className="text-sm text-gray-400 mt-4 italic">{footer}</p>}
                        {link && linkText && (
                          <Link href={link} className="text-[#1A9CB0] font-semibold hover:underline mt-4 inline-block">
                            {linkText} →
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
