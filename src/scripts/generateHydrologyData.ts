import { prisma } from "@/lib/prisma";

// 生成指定范围内的随机数
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// 生成随机流向（0-360度）
function randomDirection(): number {
  return Math.random() * 360;
}

// 生成随机水位（-2m 到 5m）
function randomWaterLevel(): number {
  return randomInRange(-2, 5);
}

// 生成随机流速（0 到 3m/s）
function randomCurrentSpeed(): number {
  return randomInRange(0, 3);
}

async function main() {
  try {
    console.log("开始生成随机水文数据...");

    // 获取所有需要更新的记录
    const records = await prisma.coastalStationData.findMany({
      where: {
        AND: [
          { waterLevel: null },
          { currentSpeed: null },
          { currentDirection: null },
          { station: "XCS" },
        ],
      },
    });

    console.log(`找到 ${records.length} 条需要更新的记录`);

    // 批量更新记录
    let count = 0;
    let percent = 0;
    let lastPercent = 0;
    for (const record of records) {
      const updates = {
        waterLevel: randomWaterLevel(),
        currentSpeed: randomCurrentSpeed(),
        currentDirection: randomDirection(),
      };

      await prisma.coastalStationData.update({
        where: { id: record.id },
        data: updates,
      });
      count++;
      percent = Math.round((count / records.length) * 100);
      if (percent !== lastPercent) {
        console.log(`更新了 ${percent}% 的记录`);
        lastPercent = percent;
      }
    }
    console.log(`更新了 ${count} 条记录`);
    console.log("数据更新完成！");
  } catch (error) {
    console.error("生成数据时发生错误:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
