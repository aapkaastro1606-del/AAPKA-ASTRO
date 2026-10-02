import { permanentRedirect } from "next/navigation";

/**
 * Permanent 308 redirect from legacy /kundli to canonical /kundli-generator
 * Consolidating duplicate Kundli generator pages into a single canonical route for SEO & UX.
 */
export default function KundliRedirectPage() {
  permanentRedirect("/kundli-generator");
}
