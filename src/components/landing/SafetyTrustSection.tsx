import { motion } from "framer-motion";
import {
  FaClipboardCheck,
  FaShieldAlt,
  FaHome,
  FaHandHoldingHeart,
  FaComments,
  FaPaw,
} from "react-icons/fa";

const highlights = [
  {
    title: "Calm, Secure Environments",
    description: "Maintain calm, clean, and secure environments",
    icon: FaHome,
  },
  {
    title: "Positive Reinforcement",
    description: "Use positive-reinforcement methods",
    icon: FaHandHoldingHeart,
  },
  {
    title: "Consistent Communication",
    description: "Provide consistent communication and updates",
    icon: FaComments,
  },
  {
    title: "Peaceful Group Play",
    description: "Create peaceful, small-group experiences",
    icon: FaPaw,
  },
];

function SafetyTrustSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF8F3]" />
      <div className="relative container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm">
            <FaShieldAlt className="text-lg" aria-hidden="true" />
            Safety &amp; Trust
          </div>

          <h2 className="mt-6 text-3xl font-bold text-[#333333] md:text-4xl">
            Safety & Trust at Ruh-Roh Retreat
          </h2>

          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            At Ruh-Roh Retreat, your dog’s safety and comfort come first.
          </p>
          <p className="mt-3 text-base text-gray-600">
            Ruh-Roh Retreat is a curated community of independent sitters who complete a third-party background check and share a naturally calm, structured care approach.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            className="bg-white/80 border border-[#1A9CB0]/15 rounded-2xl p-8 shadow-lg backdrop-blur"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] mb-6">
              <FaClipboardCheck aria-hidden="true" className="text-xl" />
            </div>
            <h3 className="text-xl font-bold text-[#333333] mb-3">
              Background-Checked Sitters
            </h3>
            <p className="text-gray-600 leading-relaxed">
              All independent sitters complete a professional background check before joining the platform. This helps ensure every family is connected with trustworthy, dependable caregivers.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/80 border border-[#1A9CB0]/15 rounded-2xl p-8 shadow-lg backdrop-blur"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] mb-6">
              <FaShieldAlt aria-hidden="true" className="text-xl" />
            </div>
            <h3 className="text-xl font-bold text-[#333333] mb-3">
              Platform-Provided Incident Protection
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Every booking includes platform-level incident protection to help cover unexpected costs from rare accidents, injuries, or property damage that may occur during a stay. This protection is automatically included with your booking, offering added peace of mind.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default SafetyTrustSection;
