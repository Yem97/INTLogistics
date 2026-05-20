"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface Pet { id: string; name: string; breed: string; species: string; status: string }
interface Buyer { id: string; name: string; email: string }

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

export default function AdminNewOrderPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [form, setForm] = useState({
    petId: "", buyerId: "", originState: "", destinationState: "",
    estimatedArrival: "", specialInstructions: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pets").then((r) => r.json()).then((data: Pet[]) =>
      setPets(data.filter((p) => p.status === "AVAILABLE"))
    );
    fetch("/api/admin/buyers").then((r) => r.json()).then(setBuyers);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create order");
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-500 mt-1">Assign a pet to a buyer and start the shipment</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pet *</label>
            <select
              required
              value={form.petId}
              onChange={(e) => setForm({ ...form, petId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select a pet…</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.breed} ({p.species})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer *</label>
            <select
              required
              value={form.buyerId}
              onChange={(e) => setForm({ ...form, buyerId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select a buyer…</option>
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin State *</label>
              <select
                required
                value={form.originState}
                onChange={(e) => setForm({ ...form, originState: e.target.value })}
                className={inputClass}
              >
                <option value="">Select…</option>
                {US_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination State *</label>
              <select
                required
                value={form.destinationState}
                onChange={(e) => setForm({ ...form, destinationState: e.target.value })}
                className={inputClass}
              >
                <option value="">Select…</option>
                {US_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival</label>
            <input
              type="date"
              value={form.estimatedArrival}
              onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
            <textarea
              rows={3}
              value={form.specialInstructions}
              onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
              className={inputClass}
              placeholder="Any special handling notes…"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {saving ? "Creating…" : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
