import { motion } from "framer-motion";
import Image from "next/image";

import { getSitterById } from "@/data/sitters";

const ABOUT_FALLBACK_PARAGRAPHS = [
  "Hi, I'm Johnny! I run a boutique-style dog care experience out of my peaceful home, where your pup is treated like family and pampered like they are on vacation.",
  "Every stay is customized to your dog's personality and needs. I'm home all day, which means your pup gets round-the-clock attention, comfort, and companionship.",
  "From enrichment walks and cuddle time to optional extras, I make sure each dog feels safe, engaged, and loved while you're away.",
];

function AboutSection() {
  const johnny = getSitterById("johnny-irvine");
  const paragraphs = johnny?.bio ?? ABOUT_FALLBACK_PARAGRAPHS;
  const heroImage = johnny?.heroImage ?? "/sitters/sr-001/profile.jpg";
  const sitterName = johnny?.name ?? "Johnny";

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <Image
              src={heroImage}
              alt={`${sitterName} with pets`}
              width={600}
              height={450}
              className="rounded-lg shadow-lg"
              objectFit="cover"
            />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6">{`About ${sitterName}`}</h2>
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={paragraph.slice(0, 12)}
                className="text-lg text-gray-700 mb-6 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
