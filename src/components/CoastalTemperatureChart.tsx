"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchTemperatureData } from "@/services/coastalApi";
import { BaseChart, calculateMovingAverage } from "@/components/BaseChart";
import { CoastalStationData } from "@/types/coastal";

interface ProcessedTemperatureData {
  date: string;
  airTemperature: number;
  seaTemperature: number;
  originalDate: Date;
  airTemperatureAvg6h?: number;
  airTemperatureAvg12h?: number;
  seaTemperatureAvg6h?: number;
  seaTemperatureAvg12h?: number;
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
  const [showAirAvg6h, setShowAirAvg6h] = React.useState(false);
  const [showAirAvg12h, setShowAirAvg12h] = React.useState(false);
  const [showSeaAvg6h, setShowSeaAvg6h] = React.useState(false);
  const [showSeaAvg12h, setShowSeaAvg12h] = React.useState(false);

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

    const baseData = data
      .map((d: CoastalStationData) => ({
        date: format(new Date(d.date), "MM-dd HH:mm", { locale: zhCN }),
        airTemperature: d.airTemperature ?? 0,
        seaTemperature: d.seaTemperature ?? 0,
        originalDate: new Date(d.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // 计算移动平均
    const withAirTemp6hAvg = calculateMovingAverage(
      baseData,
      6,
      "airTemperature"
    );
    const withAirTemp12hAvg = calculateMovingAverage(
      baseData,
      12,
      "airTemperature"
    );
    const withSeaTemp6hAvg = calculateMovingAverage(
      baseData,
      6,
      "seaTemperature"
    );
    const withSeaTemp12hAvg = calculateMovingAverage(
      baseData,
      12,
      "seaTemperature"
    );

    // 合并所有平均值
    return baseData.map((item, index) => ({
      ...item,
      airTemperatureAvg6h: withAirTemp6hAvg[index].airTemperatureAvg6h,
      airTemperatureAvg12h: withAirTemp12hAvg[index].airTemperatureAvg12h,
      seaTemperatureAvg6h: withSeaTemp6hAvg[index].seaTemperatureAvg6h,
      seaTemperatureAvg12h: withSeaTemp12hAvg[index].seaTemperatureAvg12h,
    })) as ProcessedTemperatureData[];
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
    const padding = range * 0.1; // 增加 10% 的空白区域

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

    // 生成刻度值数组，间隔0.5
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
    const padding = range * 0.1; // 增加 10% 的空白区域

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

    // 生成刻度值数组，间隔0.5
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
          <div>
            <CardTitle>气温变化趋势</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAirAvg6h}
                onChange={(e) => setShowAirAvg6h(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              6小时平均
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAirAvg12h}
                onChange={(e) => setShowAirAvg12h(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              12小时平均
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <BaseChart
            data={temperatureData}
            dataKey="airTemperature"
            color="hsl(0, 100%, 50%)"
            showAvg6h={showAirAvg6h}
            showAvg12h={showAirAvg12h}
            onAvg6hChange={setShowAirAvg6h}
            onAvg12hChange={setShowAirAvg12h}
            avg6hColor="hsl(0, 100%, 65%)"
            avg12hColor="hsl(0, 100%, 80%)"
            unit="°C"
            name="气温"
            yAxisDomain={[airTemperatureRange.min, airTemperatureRange.max]}
            yAxisTicks={airTemperatureRange.ticks}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>海温变化趋势</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSeaAvg6h}
                onChange={(e) => setShowSeaAvg6h(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              6小时平均
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSeaAvg12h}
                onChange={(e) => setShowSeaAvg12h(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              12小时平均
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <BaseChart
            data={temperatureData}
            dataKey="seaTemperature"
            color="hsl(200, 100%, 50%)"
            showAvg6h={showSeaAvg6h}
            showAvg12h={showSeaAvg12h}
            onAvg6hChange={setShowSeaAvg6h}
            onAvg12hChange={setShowSeaAvg12h}
            avg6hColor="hsl(200, 100%, 65%)"
            avg12hColor="hsl(200, 100%, 80%)"
            unit="°C"
            name="海温"
            yAxisDomain={[seaTemperatureRange.min, seaTemperatureRange.max]}
            yAxisTicks={seaTemperatureRange.ticks}
          />
        </CardContent>
      </Card>
    </>
  );
}
