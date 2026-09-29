import React from "react";
import { PLACEHOLDER_ASTROLOGER, PLACEHOLDER_CONTACT_INFO, PLACEHOLDER_SOCIAL_LINKS } from "@/config/placeholderContent";

export interface LocalBusinessJsonLdProps {
  url?: string;
  name?: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export function LocalBusinessJsonLd({
  url = "https://aapkaastro.com",
  name = "Aapka Astro — Vedic Astrology, Vastu & Gemstone Wisdom",
  telephone = PLACEHOLDER_CONTACT_INFO.phone,
  address = {
    streetAddress: "Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75",
    addressLocality: "Noida, G. B. Nagar",
    addressRegion: "Uttar Pradesh",
    postalCode: "201301",
    addressCountry: "IN",
  },
}: LocalBusinessJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name,
    url,
    telephone,
    priceRange: "₹₹",
    image: "https://aapkaastro.com/images/logo.png",
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.5672,
      longitude: 77.3248,
    },
    openingHoursSpecification: {
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
      closes: "23:00",
    },
    sameAs: [
      PLACEHOLDER_SOCIAL_LINKS.instagram.url,
      PLACEHOLDER_SOCIAL_LINKS.facebook.url,
      PLACEHOLDER_SOCIAL_LINKS.youtube.url,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PLACEHOLDER_ASTROLOGER.displayName,
    jobTitle: "Principal Vedic Astrologer & Vastu Consultant",
    worksFor: {
      "@type": "Organization",
      name: "Aapka Astro",
      url: "https://aapkaastro.com",
    },
    description: PLACEHOLDER_ASTROLOGER.bio,
    image: PLACEHOLDER_ASTROLOGER.avatarUrl,
    url: "https://aapkaastro.com/about",
    knowsAbout: [
      "Vedic Astrology (Parashari & Jaimini)",
      "Vedic Vastu Shastra",
      "Ratna Vigyan (Vedic Gemology)",
      "Panchang Calculation",
      "Muhurat Shastra",
    ],
    sameAs: [
      PLACEHOLDER_SOCIAL_LINKS.instagram.url,
      PLACEHOLDER_SOCIAL_LINKS.facebook.url,
      PLACEHOLDER_SOCIAL_LINKS.youtube.url,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
