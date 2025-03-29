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

interface TrendData {
  period: string;
  stationCode: string;
  avgSalinity: number;
  avgTemp: number;
  sampleCount: number;
}

interface TrendChartProps {
  data: TrendData[];
  interval: string;
}

const STATION_COLORS = {
  "0001": "#3b82f6", // 石岛
  "0002": "#10b981", // 小麦岛
  "0003": "#f59e0b", // 连云港
  "0004": "#6366f1", // 饮水川
};

export default function TrendChart({ data, interval }: TrendChartProps) {
  // 按站点分组数据
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.stationCode]) {
      acc[item.stationCode] = [];
    }
    acc[item.stationCode].push(item);
    return acc;
  }, {} as Record<string, TrendData[]>);

  // 找出最大盐度值
  const maxSalinity = Math.max(...data.map((item) => item.avgSalinity));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            type="category"
            allowDuplicatedCategory={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="salinity"
            label={{ value: "盐度 (‰)", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="temp"
            orientation="right"
            label={{
              value: "温度 (°C)",
              angle: 90,
              position: "insideRight",
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(3),
              name.includes("盐度") ? "盐度" : "温度",
            ]}
          />
          <Legend />
          <ReferenceLine
            y={maxSalinity}
            yAxisId="salinity"
            stroke="red"
            strokeDasharray="3 3"
            label={{ value: "历史最高值", position: "top" }}
          />

          {Object.entries(groupedData).map(([stationCode, stationData]) => (
            <>
              <Line
                key={`salinity-${stationCode}`}
                yAxisId="salinity"
                type="monotone"
                data={stationData}
                dataKey="avgSalinity"
                name={`${stationData[0]?.stationName || stationCode} 盐度`}
                stroke={STATION_COLORS[stationCode as keyof typeof STATION_COLORS]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                key={`temp-${stationCode}`}
                yAxisId="temp"
                type="monotone"
                data={stationData}
                dataKey="avgTemp"
                name={`${stationData[0]?.stationName || stationCode} 温度`}
                stroke={STATION_COLORS[stationCode as keyof typeof STATION_COLORS]}
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={{ r: 2 }}
              />
            </>
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="text-sm text-muted-foreground">
        * 红色标记表示历史最高值
      </div>
    </div>
  );
} 