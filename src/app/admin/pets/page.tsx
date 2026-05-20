"use client";

import { useEffect, useState } from "react";
import { PawPrint, Plus, Trash2, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Pet {
  id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  gender: string;
  color: string;
  price: number;
  description: string;
  status: string;
  images: string[];
}

const EMPTY_FORM = {
  name: "", breed: "", species: "", age: "", gender: "Male", color: "", price: "",
  description: "", images: "",
};

export default function AdminPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/pets");
    if (res.ok) setPets(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      price: parseFloat(form.price),
      images: form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
      healthDocs: [],
    };

    const url = editId ? `/api/pets/${editId}` : "/api/pets";
    const method = editId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      await load();
    } else {
      setError("Failed to save pet");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this pet?")) return;
    await fetch(`/api/pets/${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(pet: Pet) {
    setForm({
      name: pet.name, breed: pet.breed, species: pet.species, age: pet.age,
      gender: pet.gender, color: pet.color, price: String(pet.price),
      description: pet.description, images: pet.images.join(", "),
    });
    setEditId(pet.id);
    setShowForm(true);
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Pets</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Add Pet
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-5">{editId ? "Edit Pet" : "Add New Pet"}</h2>
          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            {([
              ["name", "Pet Name"], ["breed", "Breed"], ["species", "Species"],
              ["age", "Age (e.g. 8 weeks)"], ["color", "Color"],
            ] as [keyof typeof form, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text" required value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputClass}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className={inputClass}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number" required min="0" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma-separated)</label>
              <input
                type="text" value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className={inputClass} placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit" disabled={saving}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : editId ? "Update Pet" : "Add Pet"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="border border-gray-300 px-6 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="h-40 bg-emerald-50 flex items-center justify-center">
              {pet.images[0] ? (
                <img src={pet.images[0]} alt={pet.name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint className="w-10 h-10 text-emerald-200" />
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900">{pet.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  pet.status === "AVAILABLE" ? "bg-green-100 text-green-700" :
                  pet.status === "RESERVED" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{pet.status}</span>
              </div>
              <p className="text-sm text-gray-500">{pet.breed} · {pet.species}</p>
              <p className="text-sm font-bold text-emerald-700 mt-1">{formatCurrency(pet.price)}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => startEdit(pet)}
                  className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-gray-700 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(pet.id)}
                  className="flex items-center justify-center gap-1 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
