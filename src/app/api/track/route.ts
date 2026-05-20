import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get("tracking");

  if (!trackingNumber) {
    return NextResponse.json({ error: "Tracking number required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { trackingNumber },
    include: {
      pet: { select: { name: true, breed: true, species: true, images: true } },
      events: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json(order);
}
