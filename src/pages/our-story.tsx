import Head from "next/head";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";


export default function OurStoryPage() {
  return (
    <>
      <Head>
        <title>Our Story | Ruh-Roh Retreat</title>
        <meta
          name="description"
          content="Read the story behind Ruh-Roh Retreat - from a lifelong connection to animals to a boutique dog care network."
        />
      </Head>
      <main className="pb-20 bg-[#F4F4F9]">
        <section className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] px-4 py-2 text-sm font-semibold uppercase tracking-widest mb-6">
              <FaHeart className="text-base" aria-hidden="true" />
              Our Story
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-8 leading-tight">
              Ruh-Roh Retreat didn’t begin as a business idea — it began with a lifelong connection to animals.
            </h1>

            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Ruh-Roh Retreat didn’t start as a business idea — it started as a lifelong connection with animals.
              </p>
              <p>
                As a teenager, I worked as a veterinary assistant and later helped care for a veterinarian’s 20 Bernese Mountain Dogs. I fed them, walked them, administered medication, bathed them, supported senior dogs, and helped raise puppies. Those experiences became my introduction to what calm, attentive, compassionate care truly looks like.
              </p>
              <p>
                Years later, I pursued a career in corporate finance. For 10 years, I did what I thought I was “supposed” to do: show up, crunch numbers, present analyses, and follow a predictable routine. But even as I worked hard and tried to excel, I always felt like something was missing. I couldn’t picture myself being an entrepreneur, and I certainly didn’t think I had the creativity or confidence to build anything on my own.
              </p>
              <p>
                Then the pandemic hit. For the first time in my adult life, I slowed down — and returned to something that had always brought me joy: caring for dogs. As I dog-sat more often, I began asking myself the big questions: Am I fulfilled? Is this how I want to spend the rest of my life? What would my life look like if I followed passion instead of expectation?
              </p>
              <p>
                Those answers led to clarity. I stepped away from corporate life and focused on what made me feel purposeful. I realized that caring for dogs fulfilled me in a way my corporate work never did.
              </p>
              <p>
                When I eventually returned to dog sitting full-time, my small business grew faster than I expected. Pet parents consistently shared the same concerns: They struggled to find trustworthy care. They were anxious leaving their dogs behind. They didn’t feel peace of mind with traditional facilities.
              </p>
              <p>
                But with my structured, calm, small-group approach, those anxieties disappeared — and I realized something important: What I was doing wasn’t just dog sitting. It was solving a real problem.
              </p>
              <p>
                Then one day, my stepmom told me she wanted to do what I was doing. That moment changed everything. If she wanted to follow the same philosophy — and if pet parents loved this model — maybe I could help more sitters recreate this experience under one shared brand.
              </p>
              <p className="font-semibold text-[#333333]">
                That’s when Ruh-Roh Retreat was born.
              </p>
              <p>
                The name comes from Scooby-Doo’s iconic catchphrase — that moment when something feels uncertain. For pet parents, leaving their dog often creates that same “ruh-roh…” feeling. Our goal is to turn that uncertainty into confidence through transparent communication, vetted sitters, and a community built on trust.
              </p>
              <p>
                This isn’t a franchise and it isn’t a traditional pet-care company. It’s a curated, boutique network of independent sitters who share the same philosophy of calm environments, structured care, transparent communication, and personalized experiences. It’s a platform built with intention — one that supports sitters’ independence while offering pet parents the peace of mind they’ve always wanted.
              </p>
              <p>
                Ruh-Roh Retreat wasn’t created to chase revenue. It was created to build trust, reduce stress, and give dogs a vacation of their own — in homes filled with warmth, calmness, and genuine care.
              </p>
              <p>
                And now that it’s here, the question isn’t “Can I be an entrepreneur?”
              </p>
              <p className="font-semibold text-[#333333]">
                It’s “How far can I take this?”
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
