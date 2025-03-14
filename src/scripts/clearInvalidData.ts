import { prisma } from "@/lib/prisma";

async function findInvalidData() {
  const records = await prisma.coastalStationData.findMany({
    where: {
      airTemperature: {
        gte: 99,
      },
    },
  });

  console.log(`找到了 ${records.length} 条 空气温度大于99的记录`);

  const records2 = await prisma.coastalStationData.findMany({
    where: {
      seaTemperature: {
        gte: 99,
      },
    },
  });

  console.log(`找到了 ${records2.length} 条 海温大于99的记录`);

  const records3 = await prisma.coastalStationData.findMany({
    where: {
      windSpeed: {
        gte: 99,
      },
    },
  });

  console.log(`找到了 ${records3.length} 条 风速大于99的记录`);

  const records4 = await prisma.coastalStationData.findMany({
    where: {
      windDirection: {
        gt: 360,
      },
    },
  });

  console.log(`找到了 ${records4.length} 条 风向大于360的记录`);

  const records5 = await prisma.coastalStationData.findMany({
    where: {
      airPressure: {
        gt: 9999,
      },
    },
  });

  console.log(`找到了 ${records5.length} 条 气压大于9999的记录`);

  const all = [...records, ...records2, ...records3, ...records4, ...records5];

  console.log(`一共找到了 ${all.length} 条 无效的记录`);

  return all;
}

async function clearInvalidData() {
  const all = await findInvalidData();

  const ids = all.map((item) => item.id);

  await prisma.coastalStationData.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  console.log(`删除了 ${all.length} 条 无效的记录`);
}

clearInvalidData();
