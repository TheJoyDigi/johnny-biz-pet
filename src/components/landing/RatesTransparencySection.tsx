import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaBalanceScale,
  FaHandshake,
} from "react-icons/fa";

const highlights = [
  {
    title: "Premium Care Standards",
    description:
      "Boutique sitters keep group sizes small, provide structured routines, and share updates throughout each stay.",
    icon: FaMoneyBillWave,
    accent: "from-[#F28C38] to-[#F7B267]",
  },
  {
    title: "Fair & Transparent Rates",
    description:
      "Every listing clearly outlines nightly, daycare, and add-on pricing so you know exactly what to expect before you book.",
    icon: FaBalanceScale,
    accent: "from-[#1A9CB0] to-[#4EB8C3]",
  },
  {
    title: "Personalized Offers",
    description:
      "Sitters collaborate directly with pet parents to tailor services, discuss availability, and finalize the perfect fit.",
    icon: FaHandshake,
    accent: "from-[#6C63FF] to-[#9E95FF]",
  },
];

const rateDetails = [
  {
    label: "Overnight Boarding",
    value: "from $50/night",
  },
  {
    label: "Doggy Daycare",
    value: "from $50/day",
  },
];

function RatesTransparencySection() {
  return (
    <section
      id="rates-transparency"
      className="relative py-20 bg-[#F4F4F9] overflow-hidden"
      aria-labelledby="rates-transparency-heading"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#F28C38]/20 to-[#6C63FF]/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-[#1A9CB0]/20 to-[#E4572E]/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/10 px-4 py-2 text-sm font-semibold text-[#1A9CB0] uppercase tracking-widest">
            <FaMoneyBillWave className="text-lg" aria-hidden="true" />
            Rates &amp; Transparency
          </span>
          <h2
            id="rates-transparency-heading"
            className="mt-6 text-3xl md:text-4xl font-bold text-[#333333]"
          >
            Premium Care, Fair & Transparent Rates
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Pricing, services, and availability are set directly by each independent sitter, keeping every booking clear and collaborative.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {highlights.map(({ title, description, icon: Icon, accent }, index) => (
            <motion.article
              key={title}
              className="group relative bg-white rounded-2xl border border-gray-100 shadow-lg p-8 overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: "0 20px 35px -15px rgba(26, 156, 176, 0.35)" }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white via-white/95 to-white" />
              <div className="relative flex items-center mb-6">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-[#1A9CB0]/20`}
                >
                  <Icon aria-hidden="true" className="text-2xl" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-[#333333]">{title}</h3>
              </div>
              <p className="relative text-base text-gray-600 leading-relaxed">{description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="relative max-w-3xl mx-auto rounded-2xl border border-dashed border-[#1A9CB0]/30 bg-white/80 backdrop-blur p-8 shadow-xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold text-[#333333] mb-4 text-center">
            Typical rates start at:
          </h3>
          <ul className="space-y-3">
            {rateDetails.map(({ label, value }) => (
              <li
                key={label}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl bg-[#F4F4F9] px-5 py-4 shadow-sm"
              >
                <span className="text-base font-medium text-[#333333]">{label}</span>
                <span className="text-base text-[#1A9CB0] font-semibold">{value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-500 text-center">
            Pricing, services, and availability are set by each sitter.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default RatesTransparencySection;
