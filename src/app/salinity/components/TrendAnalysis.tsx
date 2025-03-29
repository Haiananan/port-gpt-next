"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrendData {
  period: string;
  stationCode: string;
  avgSalinity: number;
  avgTemp: number;
  sampleCount: number;
}

export default function TrendAnalysis() {
  const [station, setStation] = useState<string>();
  const [interval, setInterval] = useState("month");
  const [stations, setStations] = useState<
    Array<{ stationCode: string; stationName: string }>
  >([]);
  const [data, setData] = useState<TrendData[]>([]);

  useEffect(() => {
    // 获取站点列表
    fetch("/api/salinity/stations")
      .then((res) => res.json())
      .then((data) => {
        setStations(data);
        if (data.length > 0) {
          setStation(data[0].stationCode);
        }
      });
  }, []);

  useEffect(() => {
    if (!station) return;

    // 获取趋势数据
    fetch(`/api/salinity/trends?station=${station}&interval=${interval}`)
      .then((res) => res.json())
      .then((data) => {
        // 数据已经在后端聚合，直接使用
        setData(data);
      });
  }, [station, interval]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[200px]">
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            监测站点
          </label>
          <Select value={station} onValueChange={setStation}>
            <SelectTrigger>
              <SelectValue placeholder="选择站点" />
            </SelectTrigger>
            <SelectContent>
              {stations.map((s) => (
                <SelectItem key={s.stationCode} value={s.stationCode}>
                  {s.stationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[200px]">
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            时间间隔
          </label>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger>
              <SelectValue placeholder="选择时间间隔" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">月度趋势</SelectItem>
              <SelectItem value="year">年度趋势</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="salinityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                stroke="#94a3b8"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={{ stroke: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                dy={10}
              />
              <YAxis
                yAxisId="salinity"
                domain={[0.3, 0.35]}
                tickFormatter={(value) => value.toFixed(3)}
                label={{
                  value: "盐度 (‰)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#3b82f6", fontSize: 12 },
                  dy: 50,
                  dx: -10,
                }}
                stroke="#3b82f6"
                tick={{ fill: "#3b82f6", fontSize: 12 }}
                tickLine={{ stroke: "#3b82f6" }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                yAxisId="temp"
                orientation="right"
                domain={[0, 30]}
                tickFormatter={(value) => value.toFixed(1)}
                label={{
                  value: "温度 (°C)",
                  angle: 90,
                  position: "insideRight",
                  style: { fill: "#ef4444", fontSize: 12 },
                  dy: -50,
                  dx: 10,
                }}
                stroke="#ef4444"
                tick={{ fill: "#ef4444", fontSize: 12 }}
                tickLine={{ stroke: "#ef4444" }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  padding: "12px",
                }}
                formatter={(value: number, name: string) => [
                  value.toFixed(name === "盐度" ? 3 : 1),
                  name,
                ]}
                labelStyle={{ color: "#64748b", marginBottom: "4px" }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                yAxisId="salinity"
                type="monotone"
                dataKey="avgSalinity"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#salinityGradient)"
                name="盐度"
                // dot={{ fill: "#3b82f6", r: 2 }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="avgTemp"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGradient)"
                name="温度"
                // dot={{ fill: "#ef4444", r: 2 }}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
