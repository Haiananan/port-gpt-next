import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationCode = searchParams.get("station");
    const interval = searchParams.get("interval") || "month";

    // 获取所有数据并在内存中处理
    const data = await prisma.salinityData.findMany({
      where: {
        stationCode: stationCode || undefined,
      },
      select: {
        stationCode: true,
        date: true,
        salinity: true,
        temp08: true,
        temp14: true,
        temp20: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 按时间间隔分组并计算平均值
    const groupedData = data.reduce((acc: { [key: string]: any }, curr) => {
      const period = interval === "month" 
        ? curr.date.toISOString().slice(0, 7)  // YYYY-MM
        : curr.date.toISOString().slice(0, 4); // YYYY

      if (!acc[period]) {
        acc[period] = {
          stationCode: curr.stationCode,
          period,
          totalSalinity: 0,
          totalTemp: 0,
          count: 0,
        };
      }

      acc[period].totalSalinity += curr.salinity || 0;
      acc[period].totalTemp += ((curr.temp08 || 0) + (curr.temp14 || 0) + (curr.temp20 || 0)) / 3;
      acc[period].count += 1;

      return acc;
    }, {});

    // 计算最终平均值
    const trends = Object.values(groupedData).map((group: any) => ({
      stationCode: group.stationCode,
      period: group.period,
      avgSalinity: +(group.totalSalinity / group.count).toFixed(3),
      avgTemp: +(group.totalTemp / group.count).toFixed(1),
      sampleCount: group.count,
    }));

    return NextResponse.json(trends);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
} 