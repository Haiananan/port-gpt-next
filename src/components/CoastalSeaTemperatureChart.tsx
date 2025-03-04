"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchTemperatureData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Droplets } from "lucide-react";

interface ProcessedTemperatureData {
  date: string;
  seaTemperature: number;
  originalDate: Date;
}

interface CoastalSeaTemperatureChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalSeaTemperatureChart({
  station,
  startDate,
  endDate,
}: CoastalSeaTemperatureChartProps) {
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
        seaTemperature: d.seaTemperature ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
  }, [data]);

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
      <Card>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            加载中...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!temperatureData?.length) {
    return null;
  }

  return (
    <Card>
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
  );
}
