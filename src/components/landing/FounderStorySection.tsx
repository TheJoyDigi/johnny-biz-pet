import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";

function FounderStorySection() {
  return (
    <section className="py-20 bg-[#F4F4F9]">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest mb-6">
            <FaHeart className="text-base" aria-hidden="true" />
            Our Story
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-8 leading-tight">
            Ruh-Roh Retreat didn’t begin as a business idea — it began with a lifelong connection to animals.
          </h2>

          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              As a teenager, I worked as a veterinary assistant and later helped care for a veterinarian’s 20 Bernese Mountain Dogs. Those years taught me what calm, attentive, compassionate care truly looks like.
            </p>
            <p>
              After spending a decade in corporate finance, I realized something was missing. When the pandemic slowed everything down, I returned to the one thing that had always felt natural to me: caring for dogs.
            </p>
            <p>
              As I took on more dog-sitting, pet parents kept sharing the same concerns — they struggled to find trustworthy care, felt anxious leaving their dogs behind, and didn’t feel great about traditional facilities or other marketplace apps. My calm, structured, small-group approach seemed to ease those worries, and my little business grew faster than expected.
            </p>
            <p>
              Then one day, my stepmom told me she wanted to offer care in the same way — calm, structured, and personal. That moment sparked something bigger. If other sitters shared similar values, and if pet parents loved this experience, maybe I could build a place that simply connected everyone under one brand.
            </p>
            <p className="font-semibold text-[#333333]">
              That’s how Ruh-Roh Retreat was born.
            </p>
            <p>
              The name comes from Scooby-Doo’s iconic catchphrase — that familiar feeling when something is uncertain. For many pet parents, leaving their dog behind creates that same “ruh-roh…” moment. Our goal is to offer support, clarity, and reassurance through transparent communication, our badge system, and a curated community of background-checked sitters who naturally share a calm, structured style of care.
            </p>
            <p>
              Ruh-Roh Retreat isn’t a franchise and it isn’t a traditional pet-care company. It’s a boutique network of independent sitters who share the same ethos of calm environments, thoughtful routines, and personalized experiences. It’s a platform built with intention — one that supports sitters’ independence while giving pet parents a sense of ease.
            </p>
            <p>
              Ruh-Roh Retreat wasn’t created to chase revenue. It was created to build trust, reduce stress, and give dogs a vacation of their own in homes filled with warmth and genuine care.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FounderStorySection;
