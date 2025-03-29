"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { seaLevel2022 } from "@/data/sea-level";

export default function RegionalComparison() {
  const { regional } = seaLevel2022.annualData[0];

  const data = [
    {
      name: "渤海",
      value: regional.bohai.comparedToNormal,
    },
    {
      name: "黄海",
      value: regional.yellowSea.comparedToNormal,
    },
    {
      name: "东海",
      value: regional.eastSea.comparedToNormal,
    },
    {
      name: "南海",
      value: regional.southSea.comparedToNormal,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: "海区", position: "bottom" }} />
        <YAxis
          label={{
            value: "较常年偏差(毫米)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip formatter={(value) => [`${value}毫米`, "海平面偏差"]} />
        <Legend />
        <Bar name="2022年各海区海平面偏差" dataKey="value" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
