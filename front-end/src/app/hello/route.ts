import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const data = {
    hello: "world",
  };

  return NextResponse.json({ data });
}
