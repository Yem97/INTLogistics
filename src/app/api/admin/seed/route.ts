import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function seed() {
  const existing = await prisma.user.findUnique({
    where: { email: process.env.ADMIN_EMAIL || "admin@intlogistics.com" },
  });

  if (existing) {
    return NextResponse.json({ message: "Admin already exists" });
  }

  const hashed = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "INT Logistics Admin",
      email: process.env.ADMIN_EMAIL || "admin@intlogistics.com",
      password: hashed,
      role: "ADMIN",
    },
  });

  return NextResponse.json({ message: "Admin created", email: admin.email });
}

export async function GET() {
  try {
    return await seed();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Server error", detail: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    return await seed();
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
