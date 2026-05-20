"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import TrackingTimeline from "@/components/shared/TrackingTimeline";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { Send, PawPrint } from "lucide-react";
import { ShipmentStatus } from "@prisma/client";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Order {
  id: string;
  trackingNumber: string;
  originState: string;
  destinationState: string;
  estimatedArrival: string | null;
  specialInstructions: string | null;
  pet: { id: string; name: string; breed: string; species: string; age: string; gender: string; color: string; price: number; images: string[]; description: string };
  buyer: { id: string; name: string; email: string; phone: string | null };
  events: { id: string; status: ShipmentStatus; location: string; description: string; timestamp: string }[];
  messages: Message[];
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = (session?.user as { id?: string })?.id;

  async function loadOrder() {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) setOrder(await res.json());
  }

  useEffect(() => { loadOrder(); }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order?.messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);

    const res = await fetch(`/api/orders/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    if (res.ok) {
      setMessage("");
      await loadOrder();
    }
    setSending(false);
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const currentStatus = order.events[order.events.length - 1]?.status ?? "ORDER_PLACED";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.pet.name}&apos;s Journey</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tracking #{order.trackingNumber.slice(0, 8).toUpperCase()} · {order.originState} → {order.destinationState}
          </p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pet Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {order.pet.images[0] ? (
                  <img src={order.pet.images[0]} alt={order.pet.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <PawPrint className="w-8 h-8 text-emerald-300" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900">{order.pet.name}</h2>
                <p className="text-sm text-gray-500">{order.pet.breed} · {order.pet.species}</p>
                <p className="text-sm text-gray-500">{order.pet.age} · {order.pet.gender} · {order.pet.color}</p>
                <p className="font-bold text-emerald-700 mt-1">{formatCurrency(order.pet.price)}</p>
              </div>
            </div>
            {order.pet.description && (
              <p className="text-sm text-gray-600 mt-4 border-t pt-4">{order.pet.description}</p>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Shipping Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Origin</p>
                <p className="font-medium">{order.originState}</p>
              </div>
              <div>
                <p className="text-gray-500">Destination</p>
                <p className="font-medium">{order.destinationState}</p>
              </div>
              {order.estimatedArrival && (
                <div className="col-span-2">
                  <p className="text-gray-500">Estimated Arrival</p>
                  <p className="font-medium text-emerald-700">{formatDate(order.estimatedArrival)}</p>
                </div>
              )}
              {order.specialInstructions && (
                <div className="col-span-2">
                  <p className="text-gray-500">Special Instructions</p>
                  <p className="font-medium">{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Messages with Breeder</h3>

            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {order.messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No messages yet. Start the conversation!</p>
              ) : (
                order.messages.map((msg) => {
                  const isMe = msg.sender.id === userId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium mb-1 opacity-70">{msg.sender.name}</p>
                        )}
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-emerald-200" : "text-gray-400"}`}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right column — Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-6">Shipment Timeline</h3>
          <TrackingTimeline events={order.events} currentStatus={currentStatus} />
        </div>
      </div>
    </div>
  );
}
