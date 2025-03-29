import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stations = await prisma.$queryRaw<
      Array<{
        stationCode: string;
        stationName: string;
        latitude: number;
        longitude: number;
      }>
    >`
      SELECT DISTINCT stationCode, stationName, latitude, longitude
      FROM SalinityData
    `;

    return NextResponse.json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
} 