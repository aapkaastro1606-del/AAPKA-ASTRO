"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ArrowLeft,
  Lock,
} from "lucide-react";

interface ClientsManagerClientProps {
  canManage: boolean;
}

export default function ClientsManagerClient({ canManage }: ClientsManagerClientProps) {
  const [search, setSearch] = useState("");

  const mockClients = [
    {
      id: "cli-1",
      name: "Aarav Sharma",
      phone: "+91 98765 43210",
      totalSessions: 3,
      totalSpend: "₹620",
      lastConsulted: "18 Sep 2026",
      lagna: "Capricorn",
      rashi: "Libra",
      primaryConcern: "Career Promotion & Foreign Relocation",
      notes: "In Rahu-Guru dasha. Prescribed Yellow Sapphire and Brihaspati mantra.",
    },
    {
      id: "cli-2",
      name: "Pooja Deshmukh",
      phone: "+91 98220 11223",
      totalSessions: 2,
      totalSpend: "₹450",
      lastConsulted: "14 Sep 2026",
      lagna: "Taurus",
      rashi: "Pisces",
      primaryConcern: "Marriage Timing & Manglik Milan",
      notes: "Low Manglik dosha cancelled by Jupiter aspect in 7th house.",
    },
    {
      id: "cli-3",
      name: "Vikram Singhania",
      phone: "+91 94250 99887",
      totalSessions: 4,
      totalSpend: "₹1,850",
      lastConsulted: "02 Sep 2026",
      lagna: "Leo",
      rashi: "Aries",
      primaryConcern: "Commercial Vastu for Textile Showroom",
      notes: "Installed copper helix in South-East cash counter. Reports positive uptick.",
    },
    {
      id: "cli-4",
      name: "Sunita Aggarwal",
      phone: "+91 98140 33445",
      totalSessions: 1,
      totalSpend: "₹210",
      lastConsulted: "28 Aug 2026",
      lagna: "Virgo",
      rashi: "Cancer",
      primaryConcern: "Son Higher Education Visa",
      notes: "Timing aligned with Sun Mahadasha commencement.",
    },
  ];

  const filtered = mockClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.primaryConcern.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Operator Cockpit</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                  Seeker Directory &amp; Client CRM
                </span>
                {!canManage && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                    <Lock className="h-3 w-3" />
                    View-Only Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#6E5545]">
                Maintain comprehensive records of consultation history, birth chart coordinates, and remedy progression.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by name, phone or concern..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#E8D8C3] bg-[#FFFDF9] py-2.5 pl-10 pr-4 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C1662F]" />
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 sm:p-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8D8C3] text-[#6E5545]">
                  <th className="pb-3 font-bold">Client Profile</th>
                  <th className="pb-3 font-bold">Chart Vectors</th>
                  <th className="pb-3 font-bold">Sessions &amp; Spend</th>
                  <th className="pb-3 font-bold">Primary Topic &amp; Remedy Note</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C3]">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-[#FBF3E7]/50">
                    <td className="py-4 pr-4">
                      <div className="font-temple font-bold text-[#7B2D26] text-sm">
                        {client.name}
                      </div>
                      <span className="text-[11px] text-[#6E5545]">{client.phone}</span>
                      <span className="text-[10px] text-[#A8988B] block mt-0.5">
                        Last consulted: {client.lastConsulted}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-[#3B2A1E]">
                        Lagna: {client.lagna}
                      </div>
                      <div className="text-[11px] text-[#6E5545]">
                        Rashi: {client.rashi}
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="font-bold text-[#7B2D26]">
                        {client.totalSessions} Sessions
                      </div>
                      <span className="font-mono text-[11px] text-[#6B8E5A] font-semibold">
                        {client.totalSpend} total
                      </span>
                    </td>

                    <td className="py-4 max-w-xs pr-4">
                      <div className="font-semibold text-[#3B2A1E] truncate">
                        {client.primaryConcern}
                      </div>
                      <p className="text-[11px] text-[#6E5545] line-clamp-2 mt-0.5">
                        {client.notes}
                      </p>
                    </td>

                    <td className="py-4 text-right space-x-2">
                      <Link
                        href="/kundli-generator"
                        className="rounded-lg border border-[#E8D8C3] bg-[#FBF3E7] px-3 py-1.5 font-bold text-[#7B2D26] hover:bg-[#E8D8C3] inline-block"
                      >
                        Chart
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
