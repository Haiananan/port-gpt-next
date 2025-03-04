"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchPressureData } from "@/services/coastalApi";
import { BaseChart, calculateMovingAverage } from "@/components/BaseChart";

interface CoastalPressureChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalPressureChart({
  station,
  startDate,
  endDate,
}: CoastalPressureChartProps) {
  const [showAvg6h, setShowAvg6h] = React.useState(false);
  const [showAvg12h, setShowAvg12h] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [
      "pressure",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchPressureData(
        station,
        startDate.toISOString(),
        endDate.toISOString()
      ),
  });

  const pressureData = React.useMemo(() => {
    if (!data) return [];

    const baseData = data
      .map((d) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        airPressure: d.airPressure,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // 计算移动平均
    const withAvg6h = calculateMovingAverage(baseData, 6, "airPressure");
    const withAvg12h = calculateMovingAverage(baseData, 12, "airPressure");

    // 合并所有平均值
    return baseData.map((item, index) => ({
      ...item,
      airPressureAvg6h: withAvg6h[index].airPressureAvg6h,
      airPressureAvg12h: withAvg12h[index].airPressureAvg12h,
    }));
  }, [data]);

  // 计算气压范围
  const pressureRange = React.useMemo(() => {
    if (!pressureData.length) return { min: 0, max: 0 };
    const values = pressureData
      .map((d) => d.airPressure)
      .filter((v) => v != null);
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    // 生成刻度值数组
    const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return { min, max, ticks };
  }, [pressureData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>气压变化</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            加载中...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pressureData?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>气压变化</CardTitle>
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
          data={pressureData}
          dataKey="airPressure"
          color="hsl(41, 100%, 50%)"
          showAvg6h={showAvg6h}
          showAvg12h={showAvg12h}
          onAvg6hChange={setShowAvg6h}
          onAvg12hChange={setShowAvg12h}
          avg6hColor="hsl(41, 100%, 65%)"
          avg12hColor="hsl(41, 100%, 80%)"
          unit="hPa"
          name="气压"
          yAxisDomain={[pressureRange.min, pressureRange.max]}
          yAxisTicks={pressureRange.ticks}
        />
      </CardContent>
    </Card>
  );
}
