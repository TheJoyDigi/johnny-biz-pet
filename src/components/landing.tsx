import { RefObject, useRef } from "react";

import AboutSection from "./landing/AboutSection";
import BenefitsSection from "./landing/BenefitsSection";
import BadgeSystemSection from "./landing/BadgeSystemSection";
import FounderStorySection from "./landing/FounderStorySection";
import BookingSection from "./landing/BookingSection";
import CallToActionSection from "./landing/CallToActionSection";
import HowItWorksSection from "./landing/HowItWorksSection";
import HeroSection from "./landing/HeroSection";
import LegalTransparencySection from "./landing/LegalTransparencySection";
import RatesTransparencySection from "./landing/RatesTransparencySection";
import SafetyTrustSection from "./landing/SafetyTrustSection";
import VacationAddOnsSection from "./landing/VacationAddOnsSection";
import { Location } from "./landing/types";
import { sitters } from "@/data/sitters";

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
  const bookingRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBooking = () => scrollToSection(bookingRef);

  return (
    <div className="relative overflow-x-hidden">
      <HeroSection
        onBookNow={scrollToBooking}
      />
      <BenefitsSection />
      <VacationAddOnsSection />
      <HowItWorksSection />
      <BadgeSystemSection />
      <RatesTransparencySection />
      <SafetyTrustSection />
      <FounderStorySection />
      <LegalTransparencySection />
      <BookingSection sectionRef={bookingRef} sitters={sitters} />
      <CallToActionSection onBookNow={scrollToBooking} locations={locations} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Ruh-Roh Retreat",
            image: "https://www.ruhrohretreat.com",
            url: "https://www.ruhrohretreat.com",
            telephone: "+17143294534",
            address: {
              "@type": "PostalAddress",
              streetAddress: "13212 Telmo",
              addressLocality: "Irvine",
              addressRegion: "CA",
              postalCode: "92618",
              addressCountry: "US",
            },
            priceRange: "$$",
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                ],
                opens: "08:00",
                closes: "18:00",
              },
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Saturday"],
                opens: "09:00",
                closes: "17:00",
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
