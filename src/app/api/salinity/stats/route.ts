import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 获取每个站点的最新统计数据
    const stats = await prisma.$queryRaw`
      WITH LatestData AS (
        SELECT 
          stationCode,
          MAX(date) as latest_date
        FROM SalinityData
        GROUP BY stationCode
      )
      SELECT 
        s.stationCode,
        s.stationName,
        s.latitude,
        s.longitude,
        s.salinity,
        (s.temp08 + s.temp14 + s.temp20) / 3 as avgTemp
      FROM SalinityData s
      INNER JOIN LatestData l 
        ON s.stationCode = l.stationCode 
        AND s.date = l.latest_date
      ORDER BY s.stationCode
    `;

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
