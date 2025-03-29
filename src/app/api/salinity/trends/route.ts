import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationCode = searchParams.get("station");
    const interval = searchParams.get("interval") || "month"; // month or year

    let query = `
      SELECT 
        stationCode,
        ${
          interval === "month"
            ? `
          strftime('%Y-%m', date) as period,
          strftime('%Y') as year,
          strftime('%m') as month,
        `
            : `strftime('%Y', date) as period,`
        }
        AVG(salinity) as avgSalinity,
        AVG((temp08 + temp14 + temp20) / 3) as avgTemp,
        COUNT(*) as sampleCount
      FROM SalinityData
      WHERE 1=1
    `;

    const params: any[] = [];

    if (stationCode) {
      query += ` AND stationCode = ?`;
      params.push(stationCode);
    }

    query += `
      GROUP BY stationCode, period
      ORDER BY period
    `;

    const trends = await prisma.$queryRaw`${prisma.raw(query)}${prisma.raw(
      params.map(() => "?").join(",")
    )}${...params}`;

    return NextResponse.json(trends);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
} 