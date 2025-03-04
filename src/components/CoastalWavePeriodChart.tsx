"use client";

import * as React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
  Brush,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWaveData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

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
    queryKey: ["wave", station, startDate.toISOString(), endDate.toISOString()],
    queryFn: () =>
      fetchWaveData(station, startDate.toISOString(), endDate.toISOString()),
  });

  // 用于区域选择缩放的状态
  const [refAreaLeft, setRefAreaLeft] = React.useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = React.useState<string | null>(null);
  const [zoomDomain, setZoomDomain] = React.useState<{
    x?: [string, string];
    y?: [number, number];
  }>({});

  const waveData = React.useMemo(() => {
    if (!data) return null;
    return data
      .filter(
        (d) =>
          (d.windWavePeriod === null || d.windWavePeriod <= 99) &&
          (d.surgePeriod === null || d.surgePeriod <= 99)
      )
      .map((d) => ({
        ...d,
        date: new Date(d.date).toISOString(),
        windWavePeriod:
          typeof d.windWavePeriod === "number" ? d.windWavePeriod : null,
        surgePeriod: typeof d.surgePeriod === "number" ? d.surgePeriod : null,
      }));
  }, [data]);

  // 处理鼠标事件
  const handleMouseDown = React.useCallback((e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  }, []);

  const handleMouseMove = React.useCallback(
    (e: any) => {
      if (refAreaLeft && e && e.activeLabel) {
        setRefAreaRight(e.activeLabel);
      }
    },
    [refAreaLeft]
  );

  const handleMouseUp = React.useCallback(() => {
    if (refAreaLeft && refAreaRight && waveData) {
      const [left, right] = [refAreaLeft, refAreaRight].sort();
      const selectedData = waveData.filter(
        (entry) => entry.date >= left && entry.date <= right
      );

      const validPeriods = selectedData
        .flatMap((d) => [d.windWavePeriod, d.surgePeriod])
        .filter((p): p is number => p !== null);

      if (validPeriods.length > 0) {
        const minPeriod = Math.min(...validPeriods);
        const maxPeriod = Math.max(...validPeriods);
        const padding = (maxPeriod - minPeriod) * 0.1;

        setZoomDomain({
          x: [left, right],
          y: [minPeriod - padding, maxPeriod + padding],
        });
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, waveData]);

  if (isLoading) {
    return <Skeleton className="h-[350px]" />;
  }

  if (!waveData?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>浪周期变化</CardTitle>
        <CardDescription>
          {format(startDate, "MM-dd", { locale: zhCN })} 至{" "}
          {format(endDate, "MM-dd", { locale: zhCN })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={waveData}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={zoomDomain.x}
                allowDataOverflow
                tickFormatter={(value) =>
                  format(new Date(value), "HH:mm", { locale: zhCN })
                }
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={zoomDomain.y}
                allowDataOverflow
                tickFormatter={(value) => `${value}s`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              时间
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {format(
                                new Date(payload[0].payload.date),
                                "MM-dd HH:mm",
                                { locale: zhCN }
                              )}
                            </span>
                          </div>
                          {payload.map(
                            (entry: any) =>
                              entry.value != null && (
                                <div
                                  key={entry.dataKey}
                                  className="flex flex-col"
                                >
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    {entry.name}
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{ color: entry.color }}
                                  >
                                    {entry.value?.toFixed(1)}s
                                  </span>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                name="风浪周期"
                type="monotone"
                dataKey="windWavePeriod"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              {/* <Line
                name="涌浪周期"
                type="monotone"
                dataKey="surgePeriod"
                stroke="var(--secondary)"
                strokeWidth={2}
                dot={false}
              /> */}
              {refAreaLeft && refAreaRight && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
              )}
              <Brush
                dataKey="date"
                height={30}
                stroke="#3b82f6"
                fill="var(--background)"
                tickFormatter={(value) =>
                  format(new Date(value), "HH:mm", { locale: zhCN })
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          显示最近的风浪和涌浪周期变化趋势 <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          支持区域缩放和时间范围选择
        </div>
      </CardFooter>
    </Card>
  );
}
