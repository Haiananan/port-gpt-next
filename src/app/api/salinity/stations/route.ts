import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 获取所有唯一的站点信息
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
      ORDER BY stationCode
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
