import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationCode = searchParams.get("station");
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    let query = `
      SELECT *
      FROM SalinityData
      WHERE 1=1
    `;

    const params: any[] = [];

    if (stationCode) {
      query += ` AND stationCode = ?`;
      params.push(stationCode);
    }

    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY date DESC`;

    const data = await prisma.$queryRaw`${prisma.raw(query)}${prisma.raw(
      params.map(() => "?").join(",")
    )}${...params}`;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
} 