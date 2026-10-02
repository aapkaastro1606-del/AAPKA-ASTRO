"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClientAccountStore, SavedKundli } from "@/lib/store/clientAccountStore";
import { MandalaDivider } from "@/components/ui/MandalaDivider";
import { DiyaIcon } from "@/components/ui/DiyaIcon";
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  PhoneCall,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

export default function AccountKundliPage() {
  const [savedKundlis, setSavedKundlis] = useState<SavedKundli[]>(() =>
    ClientAccountStore.getSavedKundlis()
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    relation: "Self" as SavedKundli["relation"],
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    gender: "Male" as SavedKundli["gender"],
    lagna: "Aries (Mesha)",
    rashi: "Leo (Simha)",
    nakshatra: "Magha",
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this saved chart?")) {
      ClientAccountStore.deleteSavedKundli(id);
      setSavedKundlis(ClientAccountStore.getSavedKundlis());
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDate || !formData.birthTime || !formData.birthPlace) {
      alert("Please fill in all birth coordinates.");
      return;
    }

    ClientAccountStore.addSavedKundli(formData);
    setSavedKundlis(ClientAccountStore.getSavedKundlis());
    setShowAddModal(false);
    setFormData({
      name: "",
      relation: "Other",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      gender: "Male",
      lagna: "Taurus (Vrishabha)",
      rashi: "Moon Sign",
      nakshatra: "Rohini",
    });
  };

  return (
    <div className="bg-[#FBF3E7] text-[#3B2A1E] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B2D26] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Account Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-temple text-2xl sm:text-3xl font-bold text-[#7B2D26]">
                Saved Janam Kundlis
              </h1>
              <p className="text-xs sm:text-sm text-[#6E5545] mt-1">
                Maintain charts for yourself, family members, and business partners for instant consultation lookup.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#96372E] transition-all shadow-sm shrink-0"
            >
              <Plus className="h-4 w-4 text-[#E8A33D]" />
              <span>Add New Kundli</span>
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedKundlis.length === 0 ? (
            <div className="md:col-span-2 rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-10 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B2D26]/10 text-[#7B2D26]">
                <FileText className="h-7 w-7 text-[#C1662F]" />
              </div>
              <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                No Saved Janam Kundlis Yet
              </h3>
              <p className="text-xs sm:text-sm text-[#6E5545] max-w-md mx-auto">
                Maintain charts for yourself and family members. Save birth charts for immediate Vedic lookup during consultations.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  href="/kundli-generator"
                  className="rounded-xl bg-[#7B2D26] px-5 py-2.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#64221C] transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-[#E8A33D]" />
                  <span>Calculate Free Kundli</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="rounded-xl border border-[#E8D8C3] bg-[#FFFDF9] px-5 py-2.5 text-xs font-bold text-[#7B2D26] hover:bg-[#FBF3E7] transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4 text-[#C1662F]" />
                  <span>Add Manually</span>
                </button>
              </div>
            </div>
          ) : (
            savedKundlis.map((knd) => (
              <div
                key={knd.id}
                className="rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-6 shadow-sm flex flex-col justify-between"
              >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md bg-[#FBF3E7] px-2.5 py-0.5 text-[11px] font-bold text-[#7B2D26] border border-[#E8D8C3]">
                    {knd.relation}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(knd.id)}
                    className="text-[#A8988B] hover:text-rose-600 p-1 transition-colors"
                    title="Delete Chart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="font-temple text-lg font-bold text-[#7B2D26]">
                  {knd.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-[#6E5545]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#C1662F]" />
                    <span>{knd.birthDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#C1662F]" />
                    <span>{knd.birthTime} ({knd.gender})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#C1662F]" />
                    <span>{knd.birthPlace}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#FBF3E7] p-3 border border-[#E8D8C3] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Lagna (Ascendant):</span>
                    <strong className="text-[#7B2D26]">{knd.lagna}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Janma Rashi (Moon):</span>
                    <strong className="text-[#7B2D26]">{knd.rashi}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E5545]">Nakshatra:</span>
                    <strong className="text-[#7B2D26]">{knd.nakshatra}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8D8C3] flex items-center justify-between gap-3">
                <Link
                  href="/kundli-generator"
                  className="text-xs font-bold text-[#7B2D26] hover:underline"
                >
                  View Full Chart &rarr;
                </Link>

                <Link
                  href="/account/consult"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8A33D] px-3.5 py-1.5 text-xs font-bold text-[#3B2A1E] hover:bg-[#F6CF86] transition-all shadow-sm"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Consult with this Chart</span>
                </Link>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* Add Kundli Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#E8D8C3] bg-[#FFFDF9] p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8D8C3] pb-4 mb-6">
              <h3 className="font-temple text-xl font-bold text-[#7B2D26]">
                Save New Birth Chart
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#6E5545] hover:text-[#3B2A1E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">Relationship</label>
                  <select
                    value={formData.relation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        relation: e.target.value as SavedKundli["relation"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  >
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Business Partner">Business Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">Birth Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">Birth Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3B2A1E] mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as SavedKundli["gender"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3B2A1E] mb-1">
                  Birth City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="w-full rounded-xl border border-[#E8D8C3] bg-[#FBF3E7] p-2.5 text-xs text-[#3B2A1E] focus:outline-none focus:ring-2 focus:ring-[#7B2D26]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-[#E8D8C3] px-4 py-2 font-semibold text-[#6E5545] hover:bg-[#FBF3E7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#7B2D26] px-5 py-2 font-bold text-white hover:bg-[#96372E] shadow-sm"
                >
                  Save Birth Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
