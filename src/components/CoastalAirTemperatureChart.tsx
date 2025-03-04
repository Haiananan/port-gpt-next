"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchTemperatureData } from "@/services/coastalApi";
import { BaseChart } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";
import { Thermometer } from "lucide-react";

interface ProcessedTemperatureData {
  date: string;
  airTemperature: number;
  originalDate: Date;
}

interface CoastalAirTemperatureChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

export function CoastalAirTemperatureChart({
  station,
  startDate,
  endDate,
}: CoastalAirTemperatureChartProps) {
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

  if (!temperatureData?.length) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <BaseChart
          data={temperatureData}
          dataKey="airTemperature"
          color="hsl(0, 100%, 50%)"
          unit="°C"
          name="气温"
          icon={Thermometer}
          fitColor="hsl(0, 100%, 65%)"
        />
      </CardContent>
    </Card>
  );
}
