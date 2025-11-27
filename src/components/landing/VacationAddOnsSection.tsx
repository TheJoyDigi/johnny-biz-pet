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
    color: "#1A9CB0",
    bg: "#E6F4F1",
  },
  {
    title: "PAW-casso Painting",
    description: "A keepsake masterpiece created by your pup to take home.",
    icon: FaPalette,
    color: "#F28C38",
    bg: "#F9EDE3",
  },
  {
    title: "Pup Cup & Treat Outings",
    description: "Coffee-shop trips that pair tasty treats with tail wags.",
    icon: FaCoffee,
    color: "#6C63FF",
    bg: "#F3F0FF",
  },
  {
    title: "Cuddle & Movie Night",
    description: "Cozy downtime with snuggles, blankets, and a comforting film.",
    icon: FaFilm,
    color: "#3A7CA5",
    bg: "#EAF6FF",
  },
  {
    title: "Massage & Brushing",
    description: "Spa-style coat care that leaves pups relaxed and refreshed.",
    icon: FaHandSparkles,
    color: "#E4572E",
    bg: "#FDEFF2",
  },
  {
    title: "Calming Aromatherapy",
    description: "Soothing scents that help anxious pups unwind and rest easy.",
    icon: FaLeaf,
    color: "#4F8A41",
    bg: "#EEF7EE",
  },
];

function VacationAddOnsSection() {
  return (
    <section id="vacation-add-ons" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#F28C38]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1A9CB0]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm">
            <FaSuitcaseRolling className="text-base" aria-hidden="true" />
            Vacation-Style Add-Ons
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mt-6 mb-6">
            Make Their Stay <span className="text-[#F28C38]">Extra Special</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Add enrichment activities designed to balance fun, comfort, and relaxation for every pup in our care.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-16">
          {addOns.map(({ title, description, icon: Icon, color, bg }, index) => (
            <motion.article
              key={title}
              className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent hover:border-current transition-all duration-300 relative overflow-hidden"
              style={{ borderColor: `${color}20` }} // 20 is hex opacity
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "tween", ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                boxShadow: `0 20px 40px -15px ${color}40`,
                transition: { type: "tween", ease: "easeOut", duration: 0.25 },
              }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundColor: color }}
              />
              
              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                  style={{ backgroundColor: bg, color: color }}
                >
                  <Icon />
                </div>
                <h3 className="text-2xl font-bold text-[#333333] mb-3 group-hover:text-[#F28C38] transition-colors">
                  {title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.p
          className="text-center text-base text-gray-500 max-w-2xl mx-auto mt-16 font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          ✨ Additional options such as obedience refreshers or puzzle feeders may be available. Add-ons vary by sitter.
        </motion.p>
      </div>
    </section>
  );
}

export default VacationAddOnsSection;
