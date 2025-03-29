import { NextResponse } from "next/server";


export async function GET() {
  const data = [
    {
      stationCode: "0001",
      stationName: "Shidao",
      latitude: 36.865,
      longitude: 122.42,
    },
    {
      stationCode: "0002",
      stationName: "Xiaomaidao",
      latitude: 36.05,
      longitude: 120.4166666666667,
    },
    {
      stationCode: "0003",
      stationName: "Lianyungang",
      latitude: 34.78333333333333,
      longitude: 119.4333333333333,
    },
    {
      stationCode: "0004",
      stationName: "Yinshuichuan",
      latitude: 31.1,
      longitude: 122.1333333333333,
    },
  ];

  return NextResponse.json(data);
}
