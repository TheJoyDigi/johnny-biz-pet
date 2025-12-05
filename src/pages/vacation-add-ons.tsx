import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaTree,
  FaPalette,
  FaCoffee,
  FaFilm,
  FaHandSparkles,
  FaDog,
  FaSuitcaseRolling,
} from "react-icons/fa";

const addOns = [
  {
    title: "Sniffari Nature Walks",
    description: "Adventure walks that engage your dog's senses and curiosity.",
    icon: FaTree,
    color: "#1A9CB0",
    bg: "#E6F4F1",
    imageSrc: "/images/sniffari-nature-walks.png",
  },
  {
    title: "PAW-casso Painting",
    description: "A keepsake masterpiece created by your pup to take home.",
    icon: FaPalette,
    color: "#F28C38",
    bg: "#F9EDE3",
    imageSrc: "/images/paw-casso-painting.png",
  },
  {
    title: "Pup Cup & Treat Outings",
    description: "Coffee-shop trips that pair tasty treats with tail wags.",
    icon: FaCoffee,
    color: "#6C63FF",
    bg: "#F3F0FF",
    imageSrc: "/images/pup-cup-treat-outings.png",
  },
  {
    title: "Cuddle & Movie Night",
    description: "Cozy downtime with snuggles, blankets, and a comforting film.",
    icon: FaFilm,
    color: "#3A7CA5",
    bg: "#EAF6FF",
    imageSrc: "/images/cuddle-movie-night.png",
  },
  {
    title: "Massage & Brushing",
    description: "Spa-style coat care that leaves pups relaxed and refreshed.",
    icon: FaHandSparkles,
    color: "#E4572E",
    bg: "#FDEFF2",
    imageSrc: "/images/massage-brushing.png",
  },
  {
    title: "Dog Park Outings",
    description: "Social time and zoomies in a safe, fenced environment.",
    icon: FaDog,
    color: "#4F8A41",
    bg: "#EEF7EE",
    imageSrc: "/images/dog-park-fun.png",
  },
];

export default function VacationAddOnsPage() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <section className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm">
            <FaSuitcaseRolling className="text-base" aria-hidden="true" />
            Vacation-Style Add-Ons
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mt-6 mb-6">
            Make Their Stay <span className="text-[#F28C38]">Extra Special</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Our sitters offer optional experiences to make your dog stay memorable. Each sitter chooses which add-ons they provide based on their expertise.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Browse sitter profiles to see what each offers.
          </p>
          
          <Link 
            href="/sitters" 
            className="inline-block bg-[#F28C38] hover:bg-[#e07a26] text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
          >
            Browse Sitters
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {addOns.map(({ title, description, icon: Icon, color, bg, imageSrc }, index) => (
            <motion.article
              key={title}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-transparent hover:border-current transition-all duration-300 flex flex-col"
              style={{ borderColor: `${color}20` }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                <div
                  className="absolute bottom-4 left-4 w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-md backdrop-blur-sm bg-white/90"
                  style={{ color: color }}
                >
                  <Icon />
                </div>
              </div>

              <div className="p-8 flex-grow">
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

        <p className="text-center text-base text-gray-400 mt-16 italic">
          * Add-ons vary by sitter.
        </p>
      </section>
    </div>
  );
}
