"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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

  if (!pressureData?.length) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <BaseChart
          data={pressureData}
          dataKey="airPressure"
          color="hsl(41, 100%, 50%)"
          unit="hPa"
          name="气压"
          icon={Gauge}
          fitColor="hsl(41, 100%, 65%)"
        />
      </CardContent>
    </Card>
  );
}
