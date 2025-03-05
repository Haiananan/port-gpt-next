"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWindSpeedData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Wind } from "lucide-react";

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

  if (!windSpeedData?.length) {
    return null;
  }

  return (
    <BaseChart
      data={windSpeedData}
      dataKey="windSpeed"
      color="hsl(142.1 76.2% 36.3%)"
      unit="m/s"
      name="风速"
      icon={Wind}
      fitColor="hsl(142.1 76.2% 50%)"
    />
  );
}
