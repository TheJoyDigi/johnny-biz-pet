import { motion } from "framer-motion";
import { FaClipboardList } from "react-icons/fa";
const steps = [
  {
    title: "Browse Sitters",
    description:
      "View sitter profiles with photos, reviews, home details, and Ruh-Roh Badges.",
  },
  {
    title: "Submit a Request",
    description:
      "Choose your sitter, enter dates, and share details about your pup.",
  },
  {
    title: "Meet & Greet",
    description:
      "Your chosen sitter contacts you to schedule a meet-and-greet and confirm fit.",
  },
  {
    title: "Book & Relax",
    description:
      "Once booked, your sitter provides updates while your dog enjoys their boutique retreat.",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 bg-white overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-32 top-12 h-72 w-72 rounded-full bg-gradient-to-br from-[#F28C38]/20 to-[#6C63FF]/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-[#1A9CB0]/20 to-[#E4572E]/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/10 px-4 py-2 text-sm font-semibold text-[#1A9CB0] uppercase tracking-widest">
            <FaClipboardList className="text-lg" aria-hidden="true" />
            How It Works
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-6 text-3xl md:text-4xl font-bold text-[#333333]"
          >
            Booking through Ruh-Roh Retreat is simple, transparent, and stress-free.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-8">
          {steps.map(({ title, description }, index) => (
            <motion.div
              key={title}
              className="group relative bg-white rounded-2xl border border-gray-100 shadow-lg p-8 overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 35px -15px rgba(26, 156, 176, 0.35)",
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white via-white/90 to-white" />
              <div className="relative flex items-center mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A9CB0] text-white text-lg font-bold mr-4">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold text-[#333333]">
                  {title}
                </h3>
              </div>
              <p className="relative text-base text-gray-600 leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-12 text-sm text-gray-500 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Ruh-Roh Retreat connects clients and independent sitters but does not set pricing, guarantee services, or supervise sitters.
        </motion.p>
      </div>
    </section>
  );
}

export default HowItWorksSection;
