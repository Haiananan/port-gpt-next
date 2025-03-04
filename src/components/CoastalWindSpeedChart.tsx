"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWindSpeedData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";

interface ProcessedWindSpeedData {
  date: string;
  windSpeed: number;
  originalDate: Date;
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

    return data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        windSpeed: d.windSpeed ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
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
    const padding = range * 0.1;

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

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
      <CardHeader>
        <CardTitle>风力变化趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <BaseChart
          data={windSpeedData}
          dataKey="windSpeed"
          color="hsl(142.1 76.2% 36.3%)"
          unit="m/s"
          name="风速"
          yAxisDomain={[windSpeedRange.min, windSpeedRange.max]}
          yAxisTicks={windSpeedRange.ticks}
          fitColor="hsl(142.1 76.2% 50%)"
        />
      </CardContent>
    </Card>
  );
}
