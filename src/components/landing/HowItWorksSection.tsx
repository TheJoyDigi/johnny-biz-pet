import { motion } from "framer-motion";
import { FaClipboardList } from "react-icons/fa";

const steps = [
  {
    title: "Browse Sitters",
    description:
      "View sitter profiles with photos, reviews, home details, and Ruh-Roh Badges.",
    color: "#1A9CB0",
  },
  {
    title: "Submit a Request",
    description:
      "Choose your sitter, enter dates, and share details about your pup.",
    color: "#F28C38",
  },
  {
    title: "Meet & Greet",
    description:
      "Your chosen sitter contacts you to schedule a meet-and-greet and confirm fit.",
    color: "#6C63FF",
  },
  {
    title: "Book & Relax",
    description:
      "Once booked, your sitter provides updates while your dog enjoys their boutique retreat.",
    color: "#3A7CA5",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 bg-white overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Playful background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-[#F28C38]/10 to-[#6C63FF]/5 blur-3xl animate-pulse-slow" />
        <div className="absolute -left-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-gradient-to-tr from-[#1A9CB0]/10 to-[#E4572E]/5 blur-3xl animate-pulse-slow delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/5 backdrop-blur-md border border-[#1A9CB0]/20 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest shadow-sm">
            <FaClipboardList className="text-lg" aria-hidden="true" />
            How It Works
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-6 text-4xl md:text-5xl font-extrabold text-[#333333] tracking-tight"
          >
            Booking is <span className="text-[#1A9CB0] underline decoration-[#F28C38]/50 underline-offset-4">Simple</span> & Stress-Free
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {steps.map(({ title, description, color }, index) => (
            <motion.div
              key={title}
              className="group relative bg-white rounded-[2rem] border-2 border-transparent hover:border-current p-8 lg:p-10 shadow-lg transition-all duration-300"
              style={{ borderColor: `${color}20` }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "tween", ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                boxShadow: `0 20px 40px -15px ${color}30`,
                transition: { type: "tween", ease: "easeOut", duration: 0.25 },
              }}
            >
              <div className="flex items-start gap-6">
                <div 
                  className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl text-white text-2xl font-bold shadow-md transform group-hover:rotate-6 transition-transform duration-300"
                  style={{ backgroundColor: color }}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#333333] mb-3 group-hover:text-[color:var(--hover-color)] transition-colors" style={{ '--hover-color': color } as any}>
                    {title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default HowItWorksSection;
