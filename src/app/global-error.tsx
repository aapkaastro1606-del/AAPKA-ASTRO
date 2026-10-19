"use client";

import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Graceful Degradation] Critical global layout error captured:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Aapka Astro — Temporary Disruption</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#FBF3E7",
          color: "#3B2A1E",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            margin: "24px",
            padding: "36px 28px",
            backgroundColor: "#FFFDF9",
            border: "1px solid #E8D8C3",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(123, 45, 38, 0.08)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "999px",
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              color: "#7B2D26",
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            ॐ AAPKA ASTRO SANCTUM
          </div>

          <h1
            style={{
              color: "#7B2D26",
              fontSize: "24px",
              fontWeight: "900",
              margin: "0 0 12px 0",
              letterSpacing: "-0.5px",
            }}
          >
            Cosmic Alignment Interrupted
          </h1>

          <p
            style={{
              color: "#6E5545",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0 0 24px 0",
            }}
          >
            A core application exception occurred. Our engineers and cosmic monitors have been notified. Please try reloading or return to the sanctum homepage.
          </p>

          {error.digest && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                color: "#8C7A6B",
                backgroundColor: "#FAF5EE",
                border: "1px solid #E8D8C3",
                padding: "6px 12px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "inline-block",
              }}
            >
              Incident Ref: {error.digest}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: "#7B2D26",
                color: "#FFFDF9",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              }}
              style={{
                backgroundColor: "#FFFDF9",
                color: "#7B2D26",
                border: "1px solid #7B2D26",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Return Home
            </button>
          </div>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #E8D8C3",
              fontSize: "12px",
              color: "#6E5545",
            }}
          >
            Direct Help on WhatsApp:{" "}
            <a
              href="https://wa.me/919311215564"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#25D366", fontWeight: "bold", textDecoration: "none" }}
            >
              +91 93112 15564
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
