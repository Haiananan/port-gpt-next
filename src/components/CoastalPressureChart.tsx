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
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Gauge } from "lucide-react";

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

    return data
      .map((d) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        airPressure: d.airPressure,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
  }, [data]);

  // 计算气压范围
  const pressureRange = React.useMemo(() => {
    if (!pressureData.length) return { min: 0, max: 0 };
    const values = pressureData
      .map((d) => d.airPressure)
      .filter((v) => v != null);
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
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
        <CardTitle>气压变化趋势</CardTitle>
        <Gauge className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <BaseChart
          data={pressureData}
          dataKey="airPressure"
          color="hsl(280, 100%, 50%)"
          unit="hPa"
          name="气压"
          yAxisDomain={[pressureRange.min, pressureRange.max]}
          yAxisTicks={pressureRange.ticks}
          fitColor="hsl(280, 100%, 65%)"
          icon={Gauge}
        />
      </CardContent>
    </Card>
  );
}
