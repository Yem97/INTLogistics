import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as { id: string; role: string };

  try {
    const where = user.role === "ADMIN" ? {} : { buyerId: user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        pet: true,
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        events: { orderBy: { timestamp: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { petId, buyerId, originState, destinationState, estimatedArrival, specialInstructions } = body;

    const order = await prisma.order.create({
      data: {
        petId,
        buyerId,
        originState,
        destinationState,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
        specialInstructions,
        events: {
          create: {
            status: "ORDER_PLACED",
            location: originState,
            description: "Order has been placed and confirmed.",
          },
        },
      },
      include: { pet: true, buyer: true, events: true },
    });

    await prisma.pet.update({
      where: { id: petId },
      data: { status: "SOLD" },
    });

    await prisma.notification.create({
      data: {
        userId: buyerId,
        orderId: order.id,
        title: "Order Confirmed!",
        message: `Your order for ${order.pet.name} has been placed. Tracking #: ${order.trackingNumber}`,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
