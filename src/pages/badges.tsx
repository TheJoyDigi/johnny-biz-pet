import { motion } from "framer-motion";
import Image from "next/image";
import { GiLaurelCrown } from "react-icons/gi";
import { BADGES_LIST } from "@/constants/badges";

export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <section className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm">
            <GiLaurelCrown className="text-lg" aria-hidden="true" />
            Ruh-Roh Excellence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mt-6 mb-4">
            The Ruh-Roh Badge System
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#F28C38] mb-6">
            Stop guessing. See proof.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Reviews tell you if a sitter is great. Badges help show you <em>how</em> they’re great.
          </p>
        </motion.div>

        {/* How it works & Why this matters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-[#F4F4F9] p-8 rounded-3xl"
          >
            <h3 className="text-2xl font-bold text-[#333333] mb-4">How it works</h3>
            <p className="text-gray-600 leading-relaxed">
              Badges are awarded automatically when a sitter receives 4-5 star ratings in a category from at least 9 out of their most recent 10 client reviews. Each category has one badge—either earned or not earned.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              If a sitter’s recent ratings drop below the threshold, the badge is automatically removed. This ensures badges always reflect current client satisfaction.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-[#F4F4F9] p-8 rounded-3xl"
          >
            <h3 className="text-2xl font-bold text-[#333333] mb-4">Why this matters</h3>
            <p className="text-gray-600 leading-relaxed">
              Instead of reading through reviews, hoping to find patterns, badges instantly show you which sitters consistently excel in areas that matter to you.
            </p>
          </motion.div>
        </div>

        {/* Badge Categories */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-[#333333] text-center mb-12">Badge Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BADGES_LIST.map(({ key, title, description, imageSrc, accent }, index) => {
              const isGoldStandard = key === "gold-standard";
              return (
                <motion.div
                  key={key}
                  className={`relative overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100 ${
                    isGoldStandard ? "md:col-span-2 bg-gradient-to-b from-yellow-50/50 to-white border-yellow-200" : ""
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`relative p-8 flex flex-col h-full justify-between ${isGoldStandard ? "items-center text-center" : ""}`}>
                    <div className={`flex items-center gap-4 ${isGoldStandard ? "flex-col" : ""}`}>
                      <Image
                        src={imageSrc}
                        alt={title}
                        width={isGoldStandard ? 140 : 80}
                        height={isGoldStandard ? 140 : 80}
                        className="object-cover rounded-full"
                      />
                      <h3
                        className={`font-semibold text-[#333333] ${
                          isGoldStandard ? "text-2xl md:text-3xl mt-2" : "text-xl"
                        }`}
                      >
                        {title}
                      </h3>
                    </div>
                    <p
                      className={`mt-5 text-gray-600 leading-relaxed ${
                        isGoldStandard ? "text-lg max-w-2xl" : "text-base"
                      }`}
                    >
                      {description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
