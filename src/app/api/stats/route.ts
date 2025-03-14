import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import _ from "lodash";

interface CoastalDataRecord {
  airTemperature: number | null;
  seaTemperature: number | null;
  airPressure: number | null;
  windSpeed: number | null;
  windWaveHeight: number | null;
  windWavePeriod: number | null;
  waterLevel: number | null;
  currentSpeed: number | null;
  currentDirection: number | null;
}

// 计算趋势（使用简单的首尾差值）
function calculateTrend(data: number[]): number {
  if (data.length < 2) return 0;
  const validData = data.filter((val) => val !== null && !isNaN(val));
  if (validData.length < 2) return 0;
  return validData[validData.length - 1] - validData[0];
}

// 计算波高/周期的特殊百分位数据
function calculateWaveStats(data: number[]) {
  const validData = data.filter(
    (val) => val !== null && !isNaN(val) && val > 0
  );
  if (validData.length === 0) {
    return {
      h13: 0, // H1/3 - 有效波高(最高1/3波浪的平均值)
      h110: 0, // H1/10 - 最高1/10波浪的平均值
      h113: 0, // H1/13 - 最高1/13波浪的平均值
    };
  }

  // 对有效数据进行降序排序
  const sortedData = [...validData].sort((a, b) => b - a);

  // 计算不同百分位的数据
  const h13Count = Math.ceil(sortedData.length / 3);
  const h110Count = Math.ceil(sortedData.length / 10);
  const h113Count = Math.ceil(sortedData.length / 13);

  // 提取指定百分位的数据
  const h13Data = sortedData.slice(0, h13Count);
  const h110Data = sortedData.slice(0, h110Count);
  const h113Data = sortedData.slice(0, h113Count);

  // 计算平均值
  return {
    h13: h13Data.reduce((sum, val) => sum + val, 0) / h13Data.length,
    h110: h110Data.reduce((sum, val) => sum + val, 0) / h110Data.length,
    h113: h113Data.reduce((sum, val) => sum + val, 0) / h113Data.length,
  };
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
        waterLevel: true,
        currentSpeed: true,
        currentDirection: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // 提取波高和周期数据
    const waveHeightData = data.map(
      (d: CoastalDataRecord) => d.windWaveHeight ?? 0
    );
    const wavePeriodData = data.map(
      (d: CoastalDataRecord) => d.windWavePeriod ?? 0
    );

    // 计算波高和周期的特殊统计值
    const waveHeightSpecialStats = calculateWaveStats(waveHeightData);
    const wavePeriodSpecialStats = calculateWaveStats(wavePeriodData);

    function mockData(num: number, avg: number, variance: number) {
      const data = [];

      for (let i = 0; i < num; i++) {
        // 使用 lodash random 生成围绕平均值的随机数
        const value = _.random(avg - variance, avg + variance, true);
        data.push(value);
      }

      return {
        trend: calculateTrend(data),
        avg,
        max: Math.max(...data),
        min: Math.min(...data),
      };
    }

    function randomNumberRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

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
      waveHeight: {
        ...calculateStats(waveHeightData),
        // 添加特殊波高统计
        h13: waveHeightSpecialStats.h13,
        h110: waveHeightSpecialStats.h110,
        h113: waveHeightSpecialStats.h113,
      },
      wavePeriod: {
        ...calculateStats(wavePeriodData),
        // 添加特殊周期统计
        t13: wavePeriodSpecialStats.h13,
        t110: wavePeriodSpecialStats.h110,
        t113: wavePeriodSpecialStats.h113,
      },
      // mock
      waterLevel: mockData(data.length, randomNumberRange(0, 10), 2),
      currentSpeed: mockData(data.length, randomNumberRange(0, 10), 2),
      currentDirection: mockData(data.length, randomNumberRange(0, 360), 2),
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
