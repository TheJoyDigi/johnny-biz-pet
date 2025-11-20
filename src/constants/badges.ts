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
    description: "Hygienic, peaceful spaces for stress-free stays",
    imageSrc: "/images/badges/image0.png",
    accent: "from-[#FAD0C4] to-[#FFD1FF]",
  },
  "structured-care": {
    key: "structured-care",
    title: "Structured Care",
    description: "Consistent routines and thoughtful introductions",
    imageSrc: "/images/badges/image1.png",
    accent: "from-[#B8F2E6] to-[#AEC5EB]",
  },
  "personalized-care": {
    key: "personalized-care",
    title: "Personalized Care",
    description: "Fun add-ons and vacation-style enrichment",
    imageSrc: "/images/badges/image3.png",
    accent: "from-[#FDC5F5] to-[#FF9A9E]",
  },
  "transparency": {
    key: "transparency",
    title: "Transparency",
    description: "Reliable photo and video updates",
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
      "Sitters with strong repeat bookings and long-term trusted client relationships.",
    imageSrc: "/images/badges/image6.png",
    accent: "from-[#FFE8D6] to-[#FFC3A0]",
  },
  "five-star-consistency": {
    key: "five-star-consistency",
    title: "5-Star Consistency",
    description:
      "Sitters who consistently receive excellent reviews and provide a dependable guest experience.",
    imageSrc: "/images/badges/image7.png",
    accent: "from-[#FFF6B7] to-[#FECF6A]",
  },
  "gold-standard": {
    key: "gold-standard",
    title: "Ruh-Roh Retreat Gold Standard",
    description:
      "Sitters who earn all seven badges achieve the Ruh-Roh Gold Standard, representing the complete boutique-vacation experience.",
    imageSrc: "/images/badges/image8.png",
    accent: "from-[#FFD700] to-[#FDB931]",
  },
};

export const BADGES_LIST = Object.values(BADGE_DEFINITIONS);
