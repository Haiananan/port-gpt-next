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
import { fetchWaveData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";

interface ProcessedWaveData {
  date: string;
  windWaveHeight: number;
  originalDate: Date;
}

interface CoastalWaveHeightChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalWaveHeightChart({
  station,
  startDate,
  endDate,
}: CoastalWaveHeightChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "waveHeight",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchWaveData(station, startDate.toISOString(), endDate.toISOString()),
  });

  const waveHeightData = React.useMemo(() => {
    if (!data) return [];

    return data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        windWaveHeight: d.windWaveHeight ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
  }, [data]);

  // 计算浪高范围
  const waveHeightRange = React.useMemo(() => {
    if (!waveHeightData.length) return { min: 0, max: 0 };
    const values = waveHeightData
      .map((d) => d.windWaveHeight)
      .filter((v): v is number => v != null && !isNaN(v));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const padding = range * 0.1;

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

    const ticks = Array.from(
      { length: Math.round((max - min) * 10) + 1 },
      (_, i) => Math.round((min + i * 0.1) * 10) / 10
    );
    return { min, max, ticks };
  }, [waveHeightData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>浪高变化</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            加载中...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!waveHeightData?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>浪高变化</CardTitle>
      </CardHeader>
      <CardContent>
        <BaseChart
          data={waveHeightData}
          dataKey="windWaveHeight"
          color="hsl(35.3 91.2% 51.6%)"
          unit="m"
          name="浪高"
          yAxisDomain={[waveHeightRange.min, waveHeightRange.max]}
          yAxisTicks={waveHeightRange.ticks}
          fitColor="hsl(35.3 91.2% 65%)"
        />
      </CardContent>
    </Card>
  );
}
