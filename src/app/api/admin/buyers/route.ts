import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const buyers = await prisma.user.findMany({
    where: { role: "BUYER" },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(buyers);
}
