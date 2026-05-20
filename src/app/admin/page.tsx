import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Package, PawPrint, Users, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") redirect("/login");

  const [orders, petsCount, buyersCount, availablePets] = await Promise.all([
    prisma.order.findMany({
      include: {
        pet: true,
        buyer: { select: { name: true, email: true } },
        events: { orderBy: { timestamp: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pet.count(),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.pet.count({ where: { status: "AVAILABLE" } }),
  ]);

  const activeOrders = orders.filter(
    (o) => o.events[0]?.status !== "DELIVERED"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage shipments, pets, and buyers</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/pets"
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Manage Pets
          </Link>
          <Link
            href="/admin/orders"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            + New Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Orders", value: orders.length, icon: <Package className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
          { label: "Active Shipments", value: activeOrders.length, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Pets", value: petsCount, icon: <PawPrint className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" },
          { label: "Buyers", value: buyersCount, icon: <Users className="w-5 h-5" />, color: "text-orange-600 bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active Shipments */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Shipments</h2>
          <span className="text-sm text-gray-500">{orders.length} total</span>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No orders yet</div>
          ) : (
            orders.map((order) => {
              const currentStatus = order.events[0]?.status ?? "ORDER_PLACED";
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{order.pet.name}</span>
                      <StatusBadge status={currentStatus} />
                      {order._count.messages > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                          {order._count.messages} msg
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.buyer.name} · {order.originState} → {order.destinationState}
                    </p>
                  </div>
                  <div className="text-right text-sm flex-shrink-0">
                    <p className="font-medium text-gray-900">{formatCurrency(order.pet.price)}</p>
                    <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
