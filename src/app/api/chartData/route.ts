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
    fields.forEach((field) => {
      if (field !== "date" && field !== "id") {
        selectFields[field] = true;
      }
    });

    // 构建动态 where 条件
    const whereCondition = {
      station,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      OR: fields
        .filter((field) => field !== "date" && field !== "id")
        .map((field) => ({
          [field]: {
            not: null,
          },
        })),
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
