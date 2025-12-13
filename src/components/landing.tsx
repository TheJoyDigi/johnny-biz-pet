import { RefObject, useRef } from "react";

import BenefitsSection from "./landing/BenefitsSection";

import CallToActionSection from "./landing/CallToActionSection";
import HowItWorksSection from "./landing/HowItWorksSection";
import HeroSection from "./landing/HeroSection";

import RatesTransparencySection from "./landing/RatesTransparencySection";
import SafetyTrustSection from "./landing/SafetyTrustSection";
import FloatingCTA from "./landing/FloatingCTA";
import { Location } from "./landing/types";

const locations: Location[] = [
  {
    id: "irvine",
    name: "Irvine, CA, 92618",
    city: "Irvine",
    showAddons: true,
    lat: 33.673033,
    lng: -117.77879,
    sitterId: "johnny-irvine",
  },
  {
    id: "wildomar",
    name: "Wildomar, CA, 92595",
    city: "Wildomar",
    showAddons: false,
    lat: 33.603568,
    lng: -117.293535,
    sitterId: "trudy-wildomar",
  },
];

function LandingComponent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };



  return (
    <div className="relative overflow-x-hidden">
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <HowItWorksSection />
      <BenefitsSection />
      <SafetyTrustSection />
      <RatesTransparencySection />



      <CallToActionSection locations={locations} sectionRef={ctaRef} />
      <FloatingCTA heroRef={heroRef} ctaRef={ctaRef} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.ruhrohretreat.com#ruh-roh-retreat",
            name: "Ruh-Roh Retreat",
            description:
              "Boutique in-home dog sitting powered by Badge-Rated sitters who specialize in calm, structured care and vacation-style add-ons for Orange County and Temecula Valley pet parents.",
            image: "https://www.ruhrohretreat.com/hero/landing-hero.png",
            url: "https://www.ruhrohretreat.com",
            telephone: "+17143294534",
            priceRange: "$$",
            address: {
              "@type": "PostalAddress",
              streetAddress: "13212 Telmo",
              addressLocality: "Irvine",
              addressRegion: "CA",
              postalCode: "92618",
              addressCountry: "US",
            },
            areaServed: [
              "Irvine, California",
              "Wildomar, California",
              "Orange County, California",
              "Temecula Valley, California",
            ],
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "07:00",
                closes: "21:00",
              },
            ],
            makesOffer: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Boutique In-Home Dog Boarding",
                  serviceType: "Overnight dog care with Badge-Rated sitters",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Structured Doggy Daycare",
                  serviceType: "Calm daytime care with enrichment activities",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Vacation-Style Add-Ons",
                  serviceType: "Sniffari walks, aromatherapy, and enrichment upgrades",
                },
              },
            ],
            sameAs: [
              "https://www.facebook.com/ruhrohretreat",
              "https://www.instagram.com/ruhrohretreat",
            ],
          }),
        }}
      />
    </div>
  );
}

export default LandingComponent;
