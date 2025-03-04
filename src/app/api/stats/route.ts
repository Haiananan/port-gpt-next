import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CoastalDataRecord {
  airTemperature: number | null;
  seaTemperature: number | null;
  airPressure: number | null;
  windSpeed: number | null;
  windWaveHeight: number | null;
  windWavePeriod: number | null;
}

// 计算趋势（使用简单的首尾差值）
function calculateTrend(data: number[]): number {
  if (data.length < 2) return 0;
  const validData = data.filter((val) => val !== null && !isNaN(val));
  if (validData.length < 2) return 0;
  return validData[validData.length - 1] - validData[0];
}

// 计算统计值
function calculateStats(data: number[]) {
  const validData = data.filter((val) => val !== null && !isNaN(val));
  if (validData.length === 0) {
    return {
      max: 0,
      min: 0,
      avg: 0,
      trend: 0,
    };
  }

  return {
    max: Math.max(...validData),
    min: Math.min(...validData),
    avg: validData.reduce((sum, val) => sum + val, 0) / validData.length,
    trend: calculateTrend(validData),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get("station");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!station || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const data = await prisma.coastalStationData.findMany({
      where: {
        station,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        airTemperature: true,
        seaTemperature: true,
        airPressure: true,
        windSpeed: true,
        windWaveHeight: true,
        windWavePeriod: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const stats = {
      temperature: calculateStats(
        data.map((d: CoastalDataRecord) => d.airTemperature ?? 0)
      ),
      seaTemperature: calculateStats(
        data.map((d: CoastalDataRecord) => d.seaTemperature ?? 0)
      ),
      pressure: calculateStats(
        data.map((d: CoastalDataRecord) => d.airPressure ?? 0)
      ),
      windSpeed: calculateStats(
        data.map((d: CoastalDataRecord) => d.windSpeed ?? 0)
      ),
      waveHeight: calculateStats(
        data.map((d: CoastalDataRecord) => d.windWaveHeight ?? 0)
      ),
      wavePeriod: calculateStats(
        data.map((d: CoastalDataRecord) => d.windWavePeriod ?? 0)
      ),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
