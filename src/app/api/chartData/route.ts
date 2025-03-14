import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get("station");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const fields = searchParams.get("fields")?.split(",") || [
      "date",
      "airTemperature",
    ];
    const all = searchParams.get("all") === "true";

    if (!station || !startDate || !endDate) {
      return NextResponse.json(
        { error: "缺少必要的查询参数" },
        { status: 400 }
      );
    }

    // 构建动态 select 对象
    const selectFields: Record<string, boolean> = {
      id: true,
      date: true,
    };

    // 当请求所有数据时，包含所有字段
    if (all) {
      selectFields.airTemperature = true;
      selectFields.seaTemperature = true;
      selectFields.airPressure = true;
      selectFields.windDirection = true;
      selectFields.windSpeed = true;
      selectFields.windWaveHeight = true;
      selectFields.windWavePeriod = true;
      selectFields.station = true;
    } else {
      // 否则只选择指定字段
      fields.forEach((field) => {
        if (field !== "date" && field !== "id") {
          selectFields[field] = true;
        }
      });
    }

    // 构建动态 where 条件
    const whereCondition = {
      station,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      // 当请求所有数据时不需要过滤非空字段
      ...(all
        ? {}
        : {
            OR: fields
              .filter((field) => field !== "date" && field !== "id")
              .map((field) => ({
                [field]: {
                  not: null,
                },
              })),
          }),
    };

    // 获取指定时间范围内的数据
    const data = await prisma.coastalStationData.findMany({
      where: whereCondition,
      select: selectFields,
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("获取图表数据失败:", error);
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 });
  }
}
