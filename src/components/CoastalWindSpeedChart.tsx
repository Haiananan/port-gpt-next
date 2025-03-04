"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWindSpeedData } from "@/services/coastalApi";
import { BaseChart, calculateMovingAverage } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";

interface ProcessedWindSpeedData {
  date: string;
  windSpeed: number;
  originalDate: Date;
  windSpeedAvg6h?: number;
  windSpeedAvg12h?: number;
}

interface CoastalWindSpeedChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalWindSpeedChart({
  station,
  startDate,
  endDate,
}: CoastalWindSpeedChartProps) {
  const [showAvg6h, setShowAvg6h] = React.useState(false);
  const [showAvg12h, setShowAvg12h] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [
      "windSpeed",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchWindSpeedData(
        station,
        startDate.toISOString(),
        endDate.toISOString()
      ),
  });

  const windSpeedData = React.useMemo(() => {
    if (!data) return [];

    const baseData = data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        windSpeed: d.windSpeed ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // 计算移动平均
    const withWindSpeed6hAvg = calculateMovingAverage(baseData, 6, "windSpeed");
    const withWindSpeed12hAvg = calculateMovingAverage(
      baseData,
      12,
      "windSpeed"
    );

    // 合并所有平均值
    return baseData.map((item, index) => ({
      ...item,
      windSpeedAvg6h: withWindSpeed6hAvg[index].windSpeedAvg6h,
      windSpeedAvg12h: withWindSpeed12hAvg[index].windSpeedAvg12h,
    })) as ProcessedWindSpeedData[];
  }, [data]);

  // 计算风速范围
  const windSpeedRange = React.useMemo(() => {
    if (!windSpeedData.length) return { min: 0, max: 0 };
    const values = windSpeedData
      .map((d) => d.windSpeed)
      .filter((v): v is number => v != null && !isNaN(v));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const padding = range * 0.1; // 增加 10% 的空白区域

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

    // 生成刻度值数组，间隔0.5
    const ticks = Array.from(
      { length: Math.round((max - min) * 2) + 1 },
      (_, i) => Math.round((min + i * 0.5) * 10) / 10
    );
    return { min, max, ticks };
  }, [windSpeedData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>风力变化趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            加载中...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!windSpeedData?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>风力变化趋势</CardTitle>
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
          data={windSpeedData}
          dataKey="windSpeed"
          color="hsl(142.1 76.2% 36.3%)"
          showAvg6h={showAvg6h}
          showAvg12h={showAvg12h}
          onAvg6hChange={setShowAvg6h}
          onAvg12hChange={setShowAvg12h}
          avg6hColor="hsl(142.1 76.2% 50%)"
          avg12hColor="hsl(142.1 76.2% 65%)"
          unit="m/s"
          name="风速"
          yAxisDomain={[windSpeedRange.min, windSpeedRange.max]}
          yAxisTicks={windSpeedRange.ticks}
        />
      </CardContent>
    </Card>
  );
}
