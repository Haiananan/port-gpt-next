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
} from "recharts";
import { Card } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, ArrowUp } from "lucide-react";
import { getAnnualMeanLevels, getLongTermTrends } from "../utils/dataProcessor";

export default function TrendChart() {
  const annualData = getAnnualMeanLevels();
  const trendData = getLongTermTrends();

  const firstYear = Math.min(...annualData.map((d) => d.year));
  const lastYear = Math.max(...annualData.map((d) => d.year));
  const latestTrend = trendData[trendData.length - 1].riseRate;
  const historicalHighs = annualData.filter((d) => d.isHistoricalHigh);

  const trendLine = [
    { year: firstYear, trend: 0 },
    { year: lastYear, trend: latestTrend * (lastYear - firstYear) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-blue-500" size={24} />
            <div>
              <h3 className="font-medium">平均上升速率</h3>
              <p className="text-2xl font-bold text-blue-500 mt-1">
                {latestTrend.toFixed(1)}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  毫米/年
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <ArrowUp className="text-green-500" size={24} />
            <div>
              <h3 className="font-medium">累计上升</h3>
              <p className="text-2xl font-bold text-green-500 mt-1">
                {(latestTrend * (lastYear - firstYear)).toFixed(1)}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  毫米
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-500" size={24} />
            <div>
              <h3 className="font-medium">历史最高记录</h3>
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {historicalHighs.length}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  次
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">海平面变化趋势</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {firstYear}-{lastYear}年海平面变化及趋势分析
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
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
              formatter={(value: number) => [`${value.toFixed(1)}毫米`]}
              labelFormatter={(label) => `${label}年`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />

            <Line
              name="年均海平面"
              data={annualData}
              type="monotone"
              dataKey="meanLevel"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={({ cx, cy, payload }) => (
                <circle
                  cx={cx}
                  cy={cy}
                  r={payload.isHistoricalHigh ? 6 : 4}
                  fill={payload.isHistoricalHigh ? "#ef4444" : "#3b82f6"}
                  stroke={payload.isHistoricalHigh ? "#fff" : "none"}
                  strokeWidth={2}
                />
              )}
            />

            <Line
              name="上升趋势"
              data={trendLine}
              type="monotone"
              dataKey="trend"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />

            {historicalHighs.map((d) => (
              <ReferenceLine
                key={d.year}
                x={d.year}
                stroke="#ef4444"
                strokeDasharray="3 3"
                opacity={0.3}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>历史最高值</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>年均值</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-green-500" />
            <span>上升趋势</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
