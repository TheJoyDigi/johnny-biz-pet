export interface BadgeDefinition {
  key: string;
  title: string;
  description: string;
  imageSrc: string;
  accent: string;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  "calm-clean-environment": {
    key: "calm-clean-environment",
    title: "Calm & Clean Environment",
    description: "Clean, safe, peaceful spaces where dogs feel grounded and secure",
    imageSrc: "/images/badges/image0.png",
    accent: "from-[#FAD0C4] to-[#FFD1FF]",
  },
  "structured-care": {
    key: "structured-care",
    title: "Structured Care",
    description: "Consistent routines, smooth transitions, and thoughtful introductions that help dogs settle comfortably",
    imageSrc: "/images/badges/image1.png",
    accent: "from-[#B8F2E6] to-[#AEC5EB]",
  },
  "personalized-care": {
    key: "personalized-care",
    title: "Personalized Care",
    description: "Tailored care for each dog’s temperament and comfort needs, with optional vacation-style activities",
    imageSrc: "/images/badges/image3.png",
    accent: "from-[#FDC5F5] to-[#FF9A9E]",
  },
  "transparency": {
    key: "transparency",
    title: "Transparency",
    description: "Consistent communication that keeps you informed with meaningful updates",
    imageSrc: "/images/badges/image2.png",
    accent: "from-[#FFECB3] to-[#FFCC80]",
  },
  "playbook-excellence": {
    key: "playbook-excellence",
    title: "Playbook Excellence",
    description:
      "Sitters who naturally incorporate the Ruh-Roh Playbook to deliver a calm, boutique retreat experience.",
    imageSrc: "/images/badges/image4.png",
    accent: "from-[#D7FFD9] to-[#A7F0BA]",
  },
  "client-loyalty": {
    key: "client-loyalty",
    title: "Client Loyalty",
    description:
      "Strong record of repeat bookings reflecting trust, satisfaction, and long-term relationships",
    imageSrc: "/images/badges/image7.png",
    accent: "from-[#FFE8D6] to-[#FFC3A0]",
  },
  "five-star-consistency": {
    key: "five-star-consistency",
    title: "5-Star Consistency",
    description:
      "Consistently receives 5-star reviews and maintains exceptional service",
    imageSrc: "/images/badges/image6.png",
    accent: "from-[#FFF6B7] to-[#FECF6A]",
  },
  "gold-standard": {
    key: "gold-standard",
    title: "Gold Elite",
    description:
      "The highest honor, awarded to sitters who maintain 95%+ verification rates across all four core pillars—Calm & Clean Environment, Structured Care, Transparency, and Personalized Experience—plus Client Loyalty and Five-Star Consistency. Gold Elite sitters represent proven, consistent excellence maintained over their most recent bookings.",
    imageSrc: "/images/badges/image8.png",
    accent: "from-[#FFD700] to-[#FDB931]",
  },
};

export const BADGES_LIST = Object.values(BADGE_DEFINITIONS);
