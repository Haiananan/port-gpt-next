import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { data, overwrite } = await request.json();
    console.log(
      `开始处理上传数据，${overwrite ? "覆盖模式" : "新增模式"}，数据量: ${
        data.length
      }`
    );

    for (const record of data) {
      console.log(`处理记录: 站点=${record.station}, 日期=${record.date}`);

      if (overwrite) {
        console.log(`更新记录: 站点=${record.station}, 日期=${record.date}`);
        await prisma.coastalStationData.upsert({
          where: {
            station_date: {
              station: record.station,
              date: new Date(record.date),
            },
          },
          update: record,
          create: record,
        });
      } else {
        console.log(`创建记录: 站点=${record.station}, 日期=${record.date}`);
        await prisma.coastalStationData.create({
          data: record,
        });
      }
    }

    console.log("数据处理完成");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("处理上传数据时出错:", error);
    return NextResponse.json({ error: "上传数据失败" }, { status: 500 });
  }
}
