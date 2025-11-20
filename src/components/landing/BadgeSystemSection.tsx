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
          <span className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest">
            <GiLaurelCrown className="text-lg" aria-hidden="true" />
            Ruh-Roh Excellence
          </span>
          <h2 className="mt-6 text-3xl md:text-4xl font-bold text-[#333333]">
            The Ruh-Roh Badge System
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            The Ruh-Roh Badge System helps pet parents identify sitters who go above and beyond our boutique care standards.
          </p>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            Badges are not formal certifications — they recognize sitters who voluntarily align with our Playbook and uphold its principles.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {badges.map(({ title, description, imageSrc, accent }, index) => (
            <motion.div
              key={title}
              className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-500`} aria-hidden="true" />
              <div className="relative p-8 flex flex-col h-full justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={imageSrc}
                    alt={title}
                    width={80}
                    height={80}
                    className="object-cover rounded-full"
                  />
                  <h3 className="text-xl font-semibold text-[#333333] transition-colors duration-300">
                    {title}
                  </h3>
                </div>
                <p className="mt-5 text-gray-600 text-base leading-relaxed transition-colors duration-300">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-center text-base text-gray-600 leading-relaxed">
          Badges help pet parents easily identify sitters who voluntarily go above and beyond to create the signature Ruh-Roh
          Retreat experience.
        </p>

        <motion.div
          className="mt-16 max-w-2xl mx-auto text-center bg-[#1A9CB0]/5 border border-[#1A9CB0]/20 rounded-2xl p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#1A9CB0] text-white text-2xl shadow-lg">
            <GiLaurelCrown aria-hidden="true" />
          </div>
          <p className="mt-6 text-lg font-semibold text-[#333333]">
            Sitters who earn all seven badges achieve the Ruh-Roh Gold Standard, representing the complete boutique-vacation experience.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default BadgeSystemSection;
