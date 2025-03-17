import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log(`开始检查重复数据，收到 ${data.length} 条记录`);

    // 检查重复数据
    const duplicates = [];

    for (const record of data) {
      console.log(`检查记录: 站点=${record.station}, 日期=${record.date}`);

      const existing = await prisma.coastalStationData.findUnique({
        where: {
          station_date: {
            station: record.station,
            date: new Date(record.date),
          },
        },
      });

      if (existing) {
        console.log(
          `发现重复记录: 站点=${record.station}, 日期=${record.date}`
        );
        duplicates.push(record);
      }
    }

    console.log(`检查完成，发现 ${duplicates.length} 条重复数据`);
    return NextResponse.json({ duplicates });
  } catch (error) {
    console.error("检查重复数据时出错:", error);
    return NextResponse.json({ error: "检查重复数据失败" }, { status: 500 });
  }
}
