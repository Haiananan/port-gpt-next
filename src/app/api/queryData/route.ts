import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get("station");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");

  try {
    const where = {
      ...(station && { station }),
      ...(startDate &&
        endDate && {
          date: {
            gte: new Date(startDate).toISOString(),
            lte: new Date(endDate).toISOString(),
          },
        }),
    };

    const [total, data] = await Promise.all([
      prisma.coastalStationData.count({ where }),
      prisma.coastalStationData.findMany({
        where,
        orderBy: {
          date: "asc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "数据查询失败" }, { status: 500 });
  }
}
