"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Waves } from "lucide-react";

interface ProcessedCurrentData {
  date: string;
  currentSpeed: number;
  currentDirection: number;
  originalDate: Date;
}

interface CoastalCurrentChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalCurrentChart({
  station,
  startDate,
  endDate,
}: CoastalCurrentChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "current",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchCurrentData(station, startDate.toISOString(), endDate.toISOString()),
  });

  const currentData = React.useMemo(() => {
    if (!data) return [];

    return data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        currentSpeed: d.currentSpeed ?? 0,
        currentDirection: d.currentDirection ?? 0,
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

  if (!currentData?.length) {
    return null;
  }

  return (
    <BaseChart
      data={currentData}
      dataKey="currentSpeed"
      color="hsl(210, 80%, 50%)"
      unit="m/s"
      name="流速"
      icon={Waves}
      fitColor="hsl(210, 80%, 65%)"
    />
  );
}
