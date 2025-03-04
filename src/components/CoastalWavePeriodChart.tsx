"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWaveData } from "@/services/coastalApi";
import { BaseChart, calculateMovingAverage } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";

interface ProcessedWaveData {
  date: string;
  windWavePeriod: number;
  originalDate: Date;
  windWavePeriodAvg6h?: number;
  windWavePeriodAvg12h?: number;
}

interface CoastalWavePeriodChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalWavePeriodChart({
  station,
  startDate,
  endDate,
}: CoastalWavePeriodChartProps) {
  const [showAvg6h, setShowAvg6h] = React.useState(false);
  const [showAvg12h, setShowAvg12h] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [
      "wavePeriod",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchWaveData(station, startDate.toISOString(), endDate.toISOString()),
  });

  const wavePeriodData = React.useMemo(() => {
    if (!data) return [];

    const baseData = data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        windWavePeriod: d.windWavePeriod ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // 计算移动平均
    const withAvg6h = calculateMovingAverage(baseData, 6, "windWavePeriod");
    const withAvg12h = calculateMovingAverage(baseData, 12, "windWavePeriod");

    // 合并所有平均值
    return baseData.map((item, index) => ({
      ...item,
      windWavePeriodAvg6h: withAvg6h[index].windWavePeriodAvg6h,
      windWavePeriodAvg12h: withAvg12h[index].windWavePeriodAvg12h,
    })) as ProcessedWaveData[];
  }, [data]);

  // 计算浪周期范围
  const wavePeriodRange = React.useMemo(() => {
    if (!wavePeriodData.length) return { min: 0, max: 0 };
    const values = wavePeriodData
      .map((d) => d.windWavePeriod)
      .filter((v): v is number => v != null && !isNaN(v));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const padding = range * 0.1; // 增加 10% 的空白区域

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

    // 生成刻度值数组，间隔0.1
    const ticks = Array.from(
      { length: Math.round((max - min) * 10) + 1 },
      (_, i) => Math.round((min + i * 0.1) * 10) / 10
    );
    return { min, max, ticks };
  }, [wavePeriodData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>浪周期变化</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            加载中...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wavePeriodData?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>浪周期变化</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAvg6h}
              onChange={(e) => setShowAvg6h(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            6小时平均
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAvg12h}
              onChange={(e) => setShowAvg12h(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            12小时平均
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <BaseChart
          data={wavePeriodData}
          dataKey="windWavePeriod"
          color="hsl(280, 100%, 50%)"
          showAvg6h={showAvg6h}
          showAvg12h={showAvg12h}
          onAvg6hChange={setShowAvg6h}
          onAvg12hChange={setShowAvg12h}
          avg6hColor="hsl(280, 100%, 65%)"
          avg12hColor="hsl(280, 100%, 80%)"
          unit="s"
          name="浪周期"
          yAxisDomain={[wavePeriodRange.min, wavePeriodRange.max]}
          yAxisTicks={wavePeriodRange.ticks}
        />
      </CardContent>
    </Card>
  );
}
