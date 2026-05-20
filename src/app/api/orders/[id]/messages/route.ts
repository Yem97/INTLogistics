import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  const user = session.user as { id: string; role: string };

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (user.role !== "ADMIN" && order.buyerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: { orderId: id, senderId: user.id, content },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    if (user.role === "BUYER") {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (admin) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            orderId: id,
            title: "New Message from Buyer",
            message: `${session.user.name} sent a message about order #${order.trackingNumber}`,
          },
        });
      }
    } else {
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          orderId: id,
          title: "New Message from Breeder",
          message: content.substring(0, 100),
        },
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
