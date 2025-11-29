import { motion } from "framer-motion";
import Image from "next/image";
import { GiLaurelCrown } from "react-icons/gi";
import { BADGES_LIST } from "@/constants/badges";

const badges = BADGES_LIST;

function BadgeSystemSection() {
  return (
    <section className="relative py-20 bg-white">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F4F4F9] to-transparent" aria-hidden="true" />
      <div className="container relative mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm">
            <GiLaurelCrown className="text-lg" aria-hidden="true" />
            Ruh-Roh Excellence
          </span>
          <h2 className="mt-6 text-3xl md:text-4xl font-bold text-[#333333]">
            The Ruh-Roh Badge System
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            The Ruh-Roh Badge System gives pet parents clearer insight into each sitter's strengths. Instead of wondering whether a sitter typically sends updates or maintains a calm, clean space, badges highlight patterns that real pet parents consistently mention in their reviews. Sitters earn badges automatically <strong>based on real client feedback</strong>, giving you helpful guidance as you choose the sitter whose style fits your dog best.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {badges.map(({ key, title, description, imageSrc, accent }, index) => {
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
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-500`}
                  aria-hidden="true"
                />
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
                      className={`font-semibold text-[#333333] transition-colors duration-300 ${
                        isGoldStandard ? "text-2xl md:text-3xl mt-2" : "text-xl"
                      }`}
                    >
                      {title}
                    </h3>
                  </div>
                  <p
                    className={`mt-5 text-gray-600 leading-relaxed transition-colors duration-300 ${
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

        <p className="mt-12 text-center text-base text-gray-600 leading-relaxed">
          Badges help pet parents easily identify sitters who voluntarily go above and beyond to create the signature Ruh-Roh
          Retreat experience.
        </p>


      </div>
    </section>
  );
}

export default BadgeSystemSection;
