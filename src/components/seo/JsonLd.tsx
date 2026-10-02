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
    addressLocality: "Noida, G.B. Nagar",
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
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Vedic Astrology & Vastu Consultation Products",
      itemListElement: [
        {
          "@type": "Offer",
          name: "1-on-1 Vedic Astrology Consultation",
          price: "1051",
          priceCurrency: "INR",
          description: "Flat ₹1,051 first-time promotional fee (Regular ₹2,100).",
        },
        {
          "@type": "Offer",
          name: "Vedic & Devta Vaastu Consultation",
          price: "15000",
          priceCurrency: "INR",
          description: "Standing promotional fee of Flat ₹15,000 (Regular ₹25,000).",
        },
        {
          "@type": "Offer",
          name: "Janam Kundli Full PDF Report",
          price: "501",
          priceCurrency: "INR",
          description: "Downloadable high-precision formatted PDF report for Flat ₹501.",
        },
      ],
    },
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

export function ConsultationServicesJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Aapka Astro Consultation Products & Services",
    itemListElement: [
      {
        "@type": "Product",
        name: "1-on-1 Vedic Astrology Consultation",
        description:
          "Comprehensive 1-on-1 personal Vedic horoscope reading with Acharya Niraj Kumar across Voice, Video, or Live Chat.",
        image: "https://aapkaastro.com/images/logo.png",
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "1051",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://aapkaastro.com/consult",
          description: "Flat ₹1,051 introductory promotional fee for first-time clients (Standard rate ₹2,100).",
        },
      },
      {
        "@type": "Product",
        name: "Vedic & Devta Vaastu Consultation",
        description:
          "Comprehensive Devta Vaastu and Energy Vaastu spatial audit for residential, commercial, or industrial properties.",
        image: "https://aapkaastro.com/images/logo.png",
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "15000",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://aapkaastro.com/consult?product=vaastu",
          description: "Standing promotional fee of Flat ₹15,000 for all clients (Discounted from ₹25,000).",
        },
      },
      {
        "@type": "Product",
        name: "Comprehensive Janam Kundli PDF Report",
        description:
          "Full formatted, multi-page downloadable PDF Vedic astrological dossier calculated from verified Swiss Ephemeris.",
        image: "https://aapkaastro.com/images/logo.png",
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "501",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://aapkaastro.com/kundli-generator",
          description: "Download Full Formatted PDF Report for Flat ₹501 (Free online chart viewing permanently complimentary).",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
