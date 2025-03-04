"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWaveData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Timer } from "lucide-react";

interface ProcessedWaveData {
  date: string;
  windWavePeriod: number;
  originalDate: Date;
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

    return data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        windWavePeriod: d.windWavePeriod ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
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
    const padding = range * 0.1;

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

    const ticks = Array.from(
      { length: Math.round((max - min) * 10) + 1 },
      (_, i) => Math.round((min + i * 0.1) * 10) / 10
    );
    return { min, max, ticks };
  }, [wavePeriodData]);

  if (isLoading) {
    return (
      <Card>
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
      <CardContent>
        <BaseChart
          data={wavePeriodData}
          dataKey="windWavePeriod"
          color="hsl(280, 100%, 50%)"
          unit="s"
          name="浪周期"
          yAxisDomain={[wavePeriodRange.min, wavePeriodRange.max]}
          yAxisTicks={wavePeriodRange.ticks}
          fitColor="hsl(280, 100%, 65%)"
          icon={Timer}
        />
      </CardContent>
    </Card>
  );
}
