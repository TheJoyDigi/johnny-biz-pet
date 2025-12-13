import Link from "next/link";
import { FaPaw } from "react-icons/fa";

import MultiLocationMap from "../MultiLocationMap";
import { Location } from "./types";

import { RefObject } from "react";

type CallToActionSectionProps = {
  locations: Location[];
  sectionRef?: RefObject<HTMLElement>;
};

function CallToActionSection({ locations, sectionRef }: CallToActionSectionProps) {
  return (
    <section id="contact" className="py-16 bg-[#1A9CB0]" ref={sectionRef}>
      <div className="container mx-auto px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for the Ruh-Roh Retreat experience?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Calm environments, structured care, and personalized experiences await.
        </p>
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/sitters"
            className="bg-[#F28C38] hover:bg-[#e07a26] text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaPaw className="h-5 w-5" aria-hidden="true" />
            Find Your Perfect Sitter
          </Link>

        </div>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
          <a href="tel:+17143294534" className="flex items-center text-xl hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
            +1 (714) 329-4534
          </a>
          <a href="mailto:hello@ruhrohretreat.com" className="flex items-center text-xl hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            hello@ruhrohretreat.com
          </a>
        </div>

        <div className="mt-12 space-y-6">
          <div>
            <p className="uppercase tracking-widest text-sm font-semibold text-white/80">Serving Orange County & Surrounding Areas</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-xl">{loc.name}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
            <MultiLocationMap locations={locations} />
          </div>
          <p className="text-lg text-white/90 mt-6">Your Dog Deserves a Vacation Too. 🐾</p>
        </div>
      </div>
    </section>
  );
}

export default CallToActionSection;
