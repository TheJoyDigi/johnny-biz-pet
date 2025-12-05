import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaBalanceScale, FaUserShield, FaClipboardList } from "react-icons/fa";


const highlights = [
  {
    icon: FaBalanceScale,
    title: "Independent Platform",
    description:
      "Ruh-Roh Retreat LLC is a technology platform that connects pet parents with independent sitters.",
  },
  {
    icon: FaUserShield,
    title: "Independent Sitters",
    description:
      "Sitters are not employees, agents, or representatives of Ruh-Roh Retreat.",
  },
  {
    icon: FaClipboardList,
    title: "Sitter Responsibility",
    description:
      "Each sitter is solely responsible for their own services, pricing, and operations.",
  },
];

export default function LegalTransparencyPage() {
  return (
    <>
      <Head>
        <title>Legal Transparency | Ruh-Roh Retreat</title>
        <meta
          name="description"
          content="Learn about how Ruh-Roh Retreat works with our community of independent sitters."
        />
      </Head>
      <main className="pb-20 bg-gradient-to-b from-white via-[#F8FAFC] to-white">
        <section className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaBalanceScale className="text-lg" aria-hidden="true" /> Legal Transparency
            </motion.span>
            <motion.p
              className="mt-6 text-lg text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We value clarity and trust. Here's what you should know about how Ruh-Roh Retreat works with our community of sitters.
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {highlights.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                className="relative bg-white rounded-2xl shadow-lg p-8 border border-[#E2E8F0]/60 hover:border-[#1A9CB0]/40 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-[#E0F7FA] text-[#1A9CB0] flex items-center justify-center text-2xl shadow-inner">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#333333]">{title}</h3>
                </div>
                <p className="text-base text-gray-600 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 max-w-2xl mx-auto text-center text-base text-gray-600"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p>
              Please review our
              <Link
                href="/terms-of-use"
                className="text-[#1A9CB0] font-semibold hover:text-[#136C7A] transition-colors duration-200 mx-1"
              >
                Terms of Service
              </Link>
              and
              <Link
                href="/privacy-policy"
                className="text-[#1A9CB0] font-semibold hover:text-[#136C7A] transition-colors duration-200 mx-1"
              >
                Privacy Policy
              </Link>
              for full details.
            </p>
          </motion.div>
        </section>
      </main>
    </>
  );
}
