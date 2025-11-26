import { motion } from "framer-motion";
import {
  FaTree,
  FaPalette,
  FaCoffee,
  FaFilm,
  FaHandSparkles,
  FaLeaf,
  FaSuitcaseRolling,
} from "react-icons/fa";

const addOns = [
  {
    title: "Sniffari Nature Walks",
    description: "Adventure walks that engage your dog's senses and curiosity.",
    icon: FaTree,
    accent: "bg-[#E6F4F1] text-[#1A9CB0]",
  },
  {
    title: "PAW-casso Painting",
    description: "A keepsake masterpiece created by your pup to take home.",
    icon: FaPalette,
    accent: "bg-[#F9EDE3] text-[#F28C38]",
  },
  {
    title: "Pup Cup & Treat Outings",
    description: "Coffee-shop trips that pair tasty treats with tail wags.",
    icon: FaCoffee,
    accent: "bg-[#F3F0FF] text-[#6C63FF]",
  },
  {
    title: "Cuddle & Movie Night",
    description: "Cozy downtime with snuggles, blankets, and a comforting film.",
    icon: FaFilm,
    accent: "bg-[#EAF6FF] text-[#3A7CA5]",
  },
  {
    title: "Massage & Brushing",
    description: "Spa-style coat care that leaves pups relaxed and refreshed.",
    icon: FaHandSparkles,
    accent: "bg-[#FDEFF2] text-[#E4572E]",
  },
  {
    title: "Calming Aromatherapy",
    description: "Soothing scents that help anxious pups unwind and rest easy.",
    icon: FaLeaf,
    accent: "bg-[#EEF7EE] text-[#4F8A41]",
  },
];

function VacationAddOnsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm">
            <FaSuitcaseRolling className="text-base" aria-hidden="true" />
            Vacation-Style Add-Ons
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mt-4">
            Make Their Stay Extra Special
          </h2>
          <p className="text-lg text-gray-600 mt-6">
            Add enrichment activities designed to balance fun, comfort, and relaxation for every pup in our care.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-16">
          {addOns.map(({ title, description, icon: Icon, accent }, index) => (
            <motion.article
              key={title}
              className="bg-[#F4F4F9] rounded-2xl p-8 shadow-lg relative overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -12 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${accent}`}
                  aria-hidden="true"
                >
                  <Icon />
                </div>
                <h3 className="text-xl font-semibold text-[#333333]">{title}</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed mt-4">{description}</p>
            </motion.article>
          ))}
        </div>

        <motion.p
          className="text-center text-sm text-gray-500 max-w-2xl mx-auto mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          Additional options such as obedience refreshers or puzzle feeders may be available. Add-ons vary by sitter.
        </motion.p>
      </div>
    </section>
  );
}

export default VacationAddOnsSection;
