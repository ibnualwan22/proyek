import { NextRequest, NextResponse } from "next/server";
import { readUsulan, writeUsulan } from "@/lib/data";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  writeUsulan(readUsulan().filter((u) => u.id !== id));
  return NextResponse.json({ ok: true });
}
