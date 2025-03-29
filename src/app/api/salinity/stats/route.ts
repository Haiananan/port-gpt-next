import { NextResponse } from "next/server";

export async function GET() {
  // 模拟统计数据
  const mockStats = [
    {
      stationCode: "0001",
      salinity: 31.2,
      avgTemp: 18.5,
    },
    {
      stationCode: "0002",
      salinity: 30.8,
      avgTemp: 19.2,
    },
    {
      stationCode: "0003",
      salinity: 29.5,
      avgTemp: 20.1,
    },
    {
      stationCode: "0004",
      salinity: 28.7,
      avgTemp: 21.3,
    },
  ];

  return NextResponse.json(mockStats);
}
