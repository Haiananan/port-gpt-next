import { prisma } from "@/lib/prisma";

async function main() {
  const records = await prisma.coastalStationData.updateMany({
    where: {
      airTemperature: {
        gte: 99,
      },
    },
    data: {
      airTemperature: null,
    },
  });

  console.log(`找到了 ${records.count} 条 空气温度大于99的记录`);

  const records2 = await prisma.coastalStationData.updateMany({
    where: {
      seaTemperature: {
        gte: 99,
      },
    },
    data: {
      seaTemperature: null,
    },
  });

  console.log(`找到了 ${records2.count} 条 海温大于99的记录`);

  const records3 = await prisma.coastalStationData.updateMany({
    where: {
      windSpeed: {
        gte: 99,
      },
    },
    data: {
      windSpeed: null,
    },
  });

  console.log(`找到了 ${records3.count} 条 风速大于99的记录`);

  const records4 = await prisma.coastalStationData.updateMany({
    where: {
      windDirection: {
        gt: 360,
      },
    },
    data: {
      windDirection: null,
    },
  });

  console.log(`找到了 ${records4.count} 条 风向大于360的记录`);

  const records5 = await prisma.coastalStationData.updateMany({
    where: {
      airPressure: {
        gt: 9999,
      },
    },
    data: {
      airPressure: null,
    },
  });

  console.log(`找到了 ${records5.count} 条 气压大于9999的记录`);

  const all =
    records.count +
    records2.count +
    records3.count +
    records4.count +
    records5.count;

  console.log(`一共更新了 ${all} 条 无效的记录`);
}

main();
