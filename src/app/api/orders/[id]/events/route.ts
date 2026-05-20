import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { status, location, description } = await req.json();

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { pet: true, buyer: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const event = await prisma.shipmentEvent.create({
      data: { orderId: id, status, location, description },
    });

    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        orderId: id,
        title: `Shipment Update: ${status.replace(/_/g, " ")}`,
        message: `${order.pet.name} is now ${status.replace(/_/g, " ").toLowerCase()} — ${description}`,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
