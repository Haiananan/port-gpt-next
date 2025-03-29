import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationCode = searchParams.get("station");
    const year = searchParams.get("year");

    let query = `
      SELECT 
        stationCode,
        stationName,
        COUNT(*) as totalRecords,
        AVG(salinity) as avgSalinity,
        MIN(salinity) as minSalinity,
        MAX(salinity) as maxSalinity,
        AVG((temp08 + temp14 + temp20) / 3) as avgTemp
      FROM SalinityData
      WHERE 1=1
    `;

    const params: any[] = [];

    if (stationCode) {
      query += ` AND stationCode = ?`;
      params.push(stationCode);
    }

    if (year) {
      query += ` AND strftime('%Y', date) = ?`;
      params.push(year);
    }

    query += ` GROUP BY stationCode, stationName`;

    const stats = await prisma.$queryRaw`${prisma.raw(query)}${prisma.raw(
      params.map(() => "?").join(",")
    )}${...params}`;

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
} 