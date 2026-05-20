"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import TrackingTimeline from "@/components/shared/TrackingTimeline";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ShipmentStatus } from "@prisma/client";

interface TrackingResult {
  id: string;
  trackingNumber: string;
  originState: string;
  destinationState: string;
  estimatedArrival: string | null;
  pet: { name: string; breed: string; species: string; images: string[] };
  events: {
    id: string;
    status: ShipmentStatus;
    location: string;
    description: string;
    timestamp: string;
  }[];
}

export default function TrackPage() {
  const [tracking, setTracking] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!tracking.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch(`/api/track?tracking=${encodeURIComponent(tracking.trim())}`);

    if (res.ok) {
      setResult(await res.json());
    } else {
      setError("No shipment found with that tracking number.");
    }
    setLoading(false);
  }

  const currentStatus = result?.events[result.events.length - 1]?.status ?? "ORDER_PLACED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-100 p-3 rounded-full">
            <Package className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Track Your Shipment</h1>
        <p className="text-gray-500 mt-2">Enter your tracking number to see your pet&apos;s status</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Enter tracking number…"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-lg text-gray-900">{result.pet.name}</h2>
              <p className="text-sm text-gray-500">{result.pet.breed} · {result.pet.species}</p>
            </div>
            <StatusBadge status={currentStatus as ShipmentStatus} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium">{result.originState}</p>
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-medium">{result.destinationState}</p>
            </div>
            {result.estimatedArrival && (
              <div className="col-span-2">
                <p className="text-gray-500">Estimated Arrival</p>
                <p className="font-medium text-emerald-700">{formatDate(result.estimatedArrival)}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Shipment Timeline</h3>
            <TrackingTimeline
              events={result.events}
              currentStatus={currentStatus as ShipmentStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
}
