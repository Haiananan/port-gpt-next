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
          icon={Timer}
          fitColor="hsl(280, 100%, 65%)"
        />
      </CardContent>
    </Card>
  );
}
