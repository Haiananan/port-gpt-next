"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchTemperatureData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Thermometer, Droplets } from "lucide-react";

interface ProcessedTemperatureData {
  date: string;
  airTemperature: number;
  seaTemperature: number;
  originalDate: Date;
}

interface CoastalTemperatureChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalTemperatureChart({
  station,
  startDate,
  endDate,
}: CoastalTemperatureChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "temperature",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchTemperatureData(
        station,
        startDate.toISOString(),
        endDate.toISOString()
      ),
  });

  const temperatureData = React.useMemo(() => {
    if (!data) return [];

    return data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        airTemperature: d.airTemperature ?? 0,
        seaTemperature: d.seaTemperature ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
  }, [data]);

  // 计算气温范围
  const airTemperatureRange = React.useMemo(() => {
    if (!temperatureData.length) return { min: 0, max: 0 };
    const values = temperatureData
      .map((d) => d.airTemperature)
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
  }, [temperatureData]);

  // 计算海温范围
  const seaTemperatureRange = React.useMemo(() => {
    if (!temperatureData.length) return { min: 0, max: 0 };
    const values = temperatureData
      .map((d) => d.seaTemperature)
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
  }, [temperatureData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>气温变化趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              加载中...
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>海温变化趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              加载中...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!temperatureData?.length) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>气温变化趋势</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BaseChart
            data={temperatureData}
            dataKey="airTemperature"
            color="hsl(0, 100%, 50%)"
            unit="°C"
            name="气温"
            yAxisDomain={[airTemperatureRange.min, airTemperatureRange.max]}
            yAxisTicks={airTemperatureRange.ticks}
            fitColor="hsl(0, 100%, 65%)"
            icon={Thermometer}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>海温变化趋势</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BaseChart
            data={temperatureData}
            dataKey="seaTemperature"
            color="hsl(200, 100%, 50%)"
            unit="°C"
            name="海温"
            yAxisDomain={[seaTemperatureRange.min, seaTemperatureRange.max]}
            yAxisTicks={seaTemperatureRange.ticks}
            fitColor="hsl(200, 100%, 65%)"
            icon={Droplets}
          />
        </CardContent>
      </Card>
    </>
  );
}
