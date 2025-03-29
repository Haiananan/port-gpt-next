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
      <div className="flex gap-4">
        <Select value={station} onValueChange={setStation}>
          <SelectTrigger className="w-[200px]">
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

        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="选择时间间隔" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">月度趋势</SelectItem>
            <SelectItem value="year">年度趋势</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis
                yAxisId="salinity"
                domain={[0.3, 0.35]}
                tickFormatter={(value) => value.toFixed(3)}
                label={{
                  value: "盐度 (‰)",
                  angle: -90,
                  position: "insideLeft",
                }}
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
                }}
              />
              <Tooltip formatter={(value: number) => value.toFixed(3)} />
              <Legend />
              <Line
                yAxisId="salinity"
                type="monotone"
                dataKey="avgSalinity"
                stroke="#3b82f6"
                name="盐度"
                dot={false}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="avgTemp"
                stroke="#ef4444"
                name="温度"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
