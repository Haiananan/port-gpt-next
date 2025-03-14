"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWaterLevelData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Droplets } from "lucide-react";

interface ProcessedWaterLevelData {
  date: string;
  waterLevel: number;
  originalDate: Date;
}

interface CoastalWaterLevelChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalWaterLevelChart({
  station,
  startDate,
  endDate,
}: CoastalWaterLevelChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "waterLevel",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchWaterLevelData(
        station,
        startDate.toISOString(),
        endDate.toISOString()
      ),
  });

  const waterLevelData = React.useMemo(() => {
    if (!data) return [];

    return data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        waterLevel: d.waterLevel ?? 0,
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

  if (!waterLevelData?.length) {
    return null;
  }

  return (
    <BaseChart
      data={waterLevelData}
      dataKey="waterLevel"
      color="hsl(220, 90%, 50%)"
      unit="m"
      name="水位"
      icon={Droplets}
      fitColor="hsl(220, 90%, 65%)"
    />
  );
}
