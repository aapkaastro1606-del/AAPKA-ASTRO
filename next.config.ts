import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/aboutus",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contactus",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/privacy-and-policy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/privacypolicy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/terms-of-use",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/tos",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/calculators/moon-sign",
        destination: "/moon-sign-calculator",
        permanent: true,
      },
      {
        source: "/calculator/moon-sign",
        destination: "/moon-sign-calculator",
        permanent: true,
      },
      {
        source: "/calculators/sun-sign",
        destination: "/sun-sign-calculator",
        permanent: true,
      },
      {
        source: "/calculator/sun-sign",
        destination: "/sun-sign-calculator",
        permanent: true,
      },
      {
        source: "/calculators/love",
        destination: "/love-calculator",
        permanent: true,
      },
      {
        source: "/calculator/love",
        destination: "/love-calculator",
        permanent: true,
      },
      {
        source: "/calculators/flames",
        destination: "/flames-calculator",
        permanent: true,
      },
      {
        source: "/calculator/flames",
        destination: "/flames-calculator",
        permanent: true,
      },
      {
        source: "/calculators/numerology",
        destination: "/numerology-calculator",
        permanent: true,
      },
      {
        source: "/calculator/numerology",
        destination: "/numerology-calculator",
        permanent: true,
      },
      {
        source: "/kundli",
        destination: "/kundli-generator",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
