"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import TrackingTimeline from "@/components/shared/TrackingTimeline";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime, formatCurrency, STATUS_LABELS } from "@/lib/utils";
import { Send, PawPrint, Plus } from "lucide-react";
import { ShipmentStatus } from "@prisma/client";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const STATUSES: ShipmentStatus[] = [
  "ORDER_PLACED","PREPARING","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","ON_HOLD",
];

interface Order {
  id: string;
  trackingNumber: string;
  originState: string;
  destinationState: string;
  estimatedArrival: string | null;
  specialInstructions: string | null;
  pet: { name: string; breed: string; species: string; age: string; gender: string; color: string; price: number; images: string[] };
  buyer: { id: string; name: string; email: string; phone: string | null };
  events: { id: string; status: ShipmentStatus; location: string; description: string; timestamp: string }[];
  messages: { id: string; content: string; createdAt: string; sender: { id: string; name: string; role: string } }[];
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ status: "IN_TRANSIT" as ShipmentStatus, location: "", description: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = (session?.user as { id?: string })?.id;

  async function load() {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) setOrder(await res.json());
  }

  useEffect(() => { load(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [order?.messages]);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/orders/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventForm),
    });
    setShowEventForm(false);
    setEventForm({ status: "IN_TRANSIT", location: "", description: "" });
    await load();
    setSaving(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await fetch(`/api/orders/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    setMessage("");
    await load();
    setSending(false);
  }

  if (!order) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
    </div>
  );

  const currentStatus = order.events[order.events.length - 1]?.status ?? "ORDER_PLACED";
  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.pet.name} — Order Detail</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tracking #{order.trackingNumber.slice(0, 8).toUpperCase()} ·{" "}
            {order.buyer.name} ({order.buyer.email})
          </p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Pet Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {order.pet.images[0] ? (
                  <img src={order.pet.images[0]} alt={order.pet.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <PawPrint className="w-8 h-8 text-emerald-300" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{order.pet.name}</h2>
                <p className="text-sm text-gray-500">{order.pet.breed} · {order.pet.species}</p>
                <p className="text-sm text-gray-500">{order.pet.age} · {order.pet.gender} · {order.pet.color}</p>
                <p className="font-bold text-emerald-700 mt-1">{formatCurrency(order.pet.price)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t pt-4">
              <div><p className="text-gray-500">Buyer</p><p className="font-medium">{order.buyer.name}</p></div>
              <div><p className="text-gray-500">Phone</p><p className="font-medium">{order.buyer.phone || "—"}</p></div>
              <div><p className="text-gray-500">From</p><p className="font-medium">{order.originState}</p></div>
              <div><p className="text-gray-500">To</p><p className="font-medium">{order.destinationState}</p></div>
              {order.estimatedArrival && (
                <div className="col-span-2">
                  <p className="text-gray-500">Est. Arrival</p>
                  <p className="font-medium text-emerald-700">{formatDate(order.estimatedArrival)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Event */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Update Shipment Status</h3>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" /> Add Update
              </button>
            </div>

            {showEventForm && (
              <form onSubmit={addEvent} className="space-y-3 border border-emerald-100 rounded-xl p-4 bg-emerald-50/50 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as ShipmentStatus })}
                    className={inputClass}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                  <select
                    required
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select state…</option>
                    {US_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    required type="text" value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className={inputClass} placeholder="e.g. Package arrived at sorting facility"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit" disabled={saving}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Update"}
                  </button>
                  <button type="button" onClick={() => setShowEventForm(false)}
                    className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {order.events.slice().reverse().map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 text-sm">
                  <StatusBadge status={ev.status} />
                  <div>
                    <p className="text-gray-700">{ev.description}</p>
                    <p className="text-gray-400 text-xs">{ev.location} · {formatDateTime(ev.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Messages</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {order.messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No messages yet</p>
              ) : (
                order.messages.map((msg) => {
                  const isMe = msg.sender.id === userId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                        {!isMe && <p className="text-xs font-medium mb-1 opacity-70">{msg.sender.name}</p>}
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-emerald-200" : "text-gray-400"}`}>{formatDateTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text" value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Reply to buyer…"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit" disabled={sending || !message.trim()}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-6">Shipment Timeline</h3>
          <TrackingTimeline events={order.events} currentStatus={currentStatus} />
        </div>
      </div>
    </div>
  );
}
