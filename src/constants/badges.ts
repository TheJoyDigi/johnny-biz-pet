export interface BadgeDefinition {
  key: string;
  title: string;
  description: string;
  imageSrc: string;
  accent: string;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  "clean-cozy": {
    key: "clean-cozy",
    title: "Clean & Cozy Environment",
    description: "Hygienic, peaceful spaces for stress-free stays",
    imageSrc: "/images/badges/image0.png",
    accent: "from-[#FAD0C4] to-[#FFD1FF]",
  },
  "structure-stability": {
    key: "structure-stability",
    title: "Structure & Stability",
    description: "Consistent routines and thoughtful introductions",
    imageSrc: "/images/badges/image1.png",
    accent: "from-[#B8F2E6] to-[#AEC5EB]",
  },
  "transparent-communication": {
    key: "transparent-communication",
    title: "Transparent Communication",
    description: "Reliable photo and video updates",
    imageSrc: "/images/badges/image2.png",
    accent: "from-[#FFECB3] to-[#FFCC80]",
  },
  "personalized-care": {
    key: "personalized-care",
    title: "Personalized Care",
    description: "Fun add-ons and vacation-style enrichment",
    imageSrc: "/images/badges/image3.png",
    accent: "from-[#FDC5F5] to-[#FF9A9E]",
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
      "Sitters with strong repeat bookings and long-term trusted client relationships.",
    imageSrc: "/images/badges/image6.png",
    accent: "from-[#FFE8D6] to-[#FFC3A0]",
  },
  "five-star-consistency": {
    key: "five-star-consistency",
    title: "Five-Star Consistency",
    description:
      "Sitters who consistently receive excellent reviews and provide a dependable guest experience.",
    imageSrc: "/images/badges/image7.png",
    accent: "from-[#FFF6B7] to-[#FECF6A]",
  },
};

export const BADGES_LIST = Object.values(BADGE_DEFINITIONS);
