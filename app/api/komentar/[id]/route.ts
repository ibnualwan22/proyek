import { NextRequest, NextResponse } from "next/server";
import { readKomentar, writeKomentar } from "@/lib/data";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  writeKomentar(readKomentar().filter((k) => k.id !== id));
  return NextResponse.json({ ok: true });
}
