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
  ReferenceLine,
  DotProps,
} from "recharts";
import { getAnnualMeanLevels, getLongTermTrends } from "../utils/dataProcessor";

export default function TrendChart() {
  const annualData = getAnnualMeanLevels();
  const trendData = getLongTermTrends();

  // 计算趋势线的起点和终点
  const firstYear = Math.min(...annualData.map((d) => d.year));
  const lastYear = Math.max(...annualData.map((d) => d.year));
  const latestTrend = trendData[trendData.length - 1].riseRate;

  const trendLine = [
    { year: firstYear, trend: 0 },
    { year: lastYear, trend: latestTrend * (lastYear - firstYear) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">海平面变化趋势（1980-2022）</h3>
        <div className="text-sm text-muted-foreground">
          年均上升速率: {latestTrend} 毫米/年
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            type="number"
            domain={[firstYear, lastYear]}
            label={{ value: "年份", position: "bottom" }}
          />
          <YAxis
            label={{
              value: "海平面变化(毫米)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}毫米`, "海平面"]}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend />

          <Line
            name="年均海平面"
            data={annualData}
            type="monotone"
            dataKey="meanLevel"
            stroke="#8884d8"
            dot={({ cx, cy, payload }) => (
              <circle
                cx={cx}
                cy={cy}
                r={payload.isHistoricalHigh ? 6 : 4}
                fill={payload.isHistoricalHigh ? "#ef4444" : "#8884d8"}
              />
            )}
          />

          <Line
            name="上升趋势"
            data={trendLine}
            type="monotone"
            dataKey="trend"
            stroke="#82ca9d"
            strokeDasharray="5 5"
            dot={false}
          />

          {annualData
            .filter((d) => d.isHistoricalHigh)
            .map((d) => (
              <ReferenceLine
                key={d.year}
                x={d.year}
                stroke="#ef4444"
                strokeDasharray="3 3"
                opacity={0.5}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="text-sm text-muted-foreground">
        * 红色标记表示历史最高值
      </div>
    </div>
  );
}
