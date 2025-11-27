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
import { LOCAL_BUSINESS_SCHEMA } from "./meta-data";
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
          __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA),
        }}
      />
    </div>
  );
}

export default LandingComponent;
