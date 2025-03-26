import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regencyId = searchParams.get("regencyId");

  if (!regencyId) {
    return NextResponse.json({ error: "regencyId diperlukan" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
