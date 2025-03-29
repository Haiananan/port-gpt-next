import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get("station");
  const search = searchParams.get("search");

  // 模拟数据
  const mockData = Array.from({ length: 100 }, (_, i) => {
    const date = new Date(2020, 3, 1 + Math.floor(i / 4));
    date.setHours([8, 14, 20][i % 3]);
    
    return {
      id: i + 1,
      stationCode: station || ["0001", "0002", "0003", "0004"][Math.floor(Math.random() * 4)],
      stationName: {
        "0001": "Shidao",
        "0002": "Xiaomaidao",
        "0003": "Lianyungang",
        "0004": "Yinshuichuan",
      }[station || ["0001", "0002", "0003", "0004"][Math.floor(Math.random() * 4)]],
      date: date.toISOString(),
      temp08: 10 + Math.random() * 10,
      temp14: 15 + Math.random() * 10,
      temp20: 12 + Math.random() * 10,
      salinity: 0.3 + Math.random() * 0.05,
    };
  });

  // 筛选数据
  let filteredData = mockData;
  
  if (station) {
    filteredData = filteredData.filter(
      (record) => record.stationCode === station
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredData = filteredData.filter(
      (record) =>
        record.stationName.toLowerCase().includes(searchLower) ||
        record.date.includes(search) ||
        record.salinity.toString().includes(search)
    );
  }

  // 按时间降序排序
  filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(filteredData);
} 