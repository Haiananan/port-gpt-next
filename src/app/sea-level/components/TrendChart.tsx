"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { seaLevel2011, seaLevel2022 } from "@/data/sea-level";

export default function TrendChart() {
  // 生成1980-2022年的数据点
  const generateData = () => {
    const startYear = 1980;
    const endYear = 2022;
    const data = [];

    // 使用2022年的最新上升速率
    const riseRate = seaLevel2022.longTermTrends.periods[0].riseRate;

    for (let year = startYear; year <= endYear; year++) {
      data.push({
        year,
        value: riseRate * (year - startYear),
      });
    }
    return data;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={generateData()}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" label={{ value: "年份", position: "bottom" }} />
        <YAxis
          label={{
            value: "海平面变化(毫米)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}毫米`, "海平面变化"]}
          labelFormatter={(label) => `${label}年`}
        />
        <Legend />
        <Line
          name="年均上升趋势"
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          dot={false}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
