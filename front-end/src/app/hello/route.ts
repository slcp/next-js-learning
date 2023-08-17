import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log(req);
  
  const data = {
    hello: "world",
  };

  return NextResponse.json({ data });
}
