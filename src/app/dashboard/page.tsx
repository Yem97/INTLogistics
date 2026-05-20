import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as { id: string; role: string };
  if (user.role === "ADMIN") redirect("/admin");

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: {
      pet: true,
      events: { orderBy: { timestamp: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">Track your pets and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You don&apos;t have any orders yet.</p>
          <Link href="/pets" className="text-emerald-600 font-medium hover:underline">
            Browse available pets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentStatus = order.events[0]?.status ?? "ORDER_PLACED";
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{order.pet.name}</h3>
                      <StatusBadge status={currentStatus} />
                    </div>
                    <p className="text-sm text-gray-500">{order.pet.breed} · {order.pet.species}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.originState} → {order.destinationState}
                    </p>
                    {order.estimatedArrival && (
                      <p className="text-sm text-emerald-700 mt-1">
                        Est. arrival: {formatDate(order.estimatedArrival)}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-gray-900">{formatCurrency(order.pet.price)}</p>
                    <p className="text-gray-400 text-xs mt-1">#{order.trackingNumber.slice(0, 8).toUpperCase()}</p>
                    <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
