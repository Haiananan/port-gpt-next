"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWaveData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Waves } from "lucide-react";

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

  if (!waveHeightData?.length) {
    return null;
  }

  return (
   
        <BaseChart
          data={waveHeightData}
          dataKey="windWaveHeight"
          color="hsl(35.3 91.2% 51.6%)"
          unit="m"
          name="浪高"
          icon={Waves}
          fitColor="hsl(35.3 91.2% 65%)"
        />
    
  );
}
