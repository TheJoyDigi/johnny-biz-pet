import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
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
    imageSrc: "/images/sniffari-nature-walks.png", // Placeholder: Reusing image due to generation limit
  },
  {
    title: "Massage & Brushing",
    description: "Spa-style coat care that leaves pups relaxed and refreshed.",
    icon: FaHandSparkles,
    color: "#E4572E",
    bg: "#FDEFF2",
    imageSrc: "/images/paw-casso-painting.png", // Placeholder: Reusing image due to generation limit
  },
  {
    title: "Calming Aromatherapy",
    description: "Soothing scents that help anxious pups unwind and rest easy.",
    icon: FaLeaf,
    color: "#4F8A41",
    bg: "#EEF7EE",
    imageSrc: "/images/pup-cup-treat-outings.png", // Placeholder: Reusing image due to generation limit
  },
];

function VacationAddOnsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section id="vacation-add-ons" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#F28C38]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1A9CB0]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto px-4 mb-12"
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

        {/* Scrollable Carousel Container */}
        <div
          ref={scrollContainerRef}
          className={`flex overflow-x-auto snap-x snap-mandatory pb-12 pt-4 gap-6 scrollbar-hide ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } px-4 md:px-[calc(50%-200px)]`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {addOns.map(({ title, description, icon: Icon, color, bg, imageSrc }, index) => (
            <motion.article
              key={title}
              className="flex-shrink-0 w-[70vw] md:w-[400px] snap-start md:snap-center group bg-white rounded-3xl shadow-lg border-2 border-transparent hover:border-current transition-all duration-300 relative overflow-hidden flex flex-col select-none"
              style={{ borderColor: `${color}20` }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
               <div className="relative h-48 md:h-48 w-full overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                   <div
                    className="absolute bottom-4 left-4 w-12 h-12 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-2xl md:text-2xl shadow-md backdrop-blur-sm bg-white/90"
                    style={{ color: color }}
                  >
                    <Icon />
                  </div>
               </div>

              <div className="p-6 md:p-8 flex-grow flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-[#333333] mb-2 md:mb-3 group-hover:text-[#F28C38] transition-colors">
                  {title}
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.p
          className="text-center text-base text-gray-500 max-w-2xl mx-auto mt-8 font-medium px-4"
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
