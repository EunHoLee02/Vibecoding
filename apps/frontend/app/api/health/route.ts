import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "welltrack-frontend",
      environment: process.env.NODE_ENV ?? "development",
    },
    { status: 200 },
  );
}
