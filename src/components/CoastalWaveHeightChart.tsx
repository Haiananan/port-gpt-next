"use client";

import * as React from "react";
import { TrendingDown, TrendingUp, Waves } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { StatsCard } from "@/components/ui/stats-card";

interface CoastalWaveHeightChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

const chartConfig = {
  windWaveHeight: {
    label: "风浪高度",
    theme: {
      light: "#14b8a6",
      dark: "#14b8a6",
    },
  },
} satisfies ChartConfig;

export function CoastalWaveHeightChart({
  station,
  startDate,
  endDate,
}: CoastalWaveHeightChartProps) {
  const {
    data: rawWaveData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wave", station, startDate.toISOString(), endDate.toISOString()],
    queryFn: () =>
      fetchWaveData(station, startDate.toISOString(), endDate.toISOString()),
  });

  // 过滤异常数据并格式化日期
  const waveData = React.useMemo(() => {
    if (!rawWaveData) return null;

    return rawWaveData
      .filter(
        (data) =>
          (data.windWaveHeight === null ||
            (typeof data.windWaveHeight === "number" &&
              data.windWaveHeight <= 99)) &&
          (data.surgeHeight === null ||
            (typeof data.surgeHeight === "number" && data.surgeHeight <= 99))
      )
      .map((data) => ({
        ...data,
        date: new Date(data.date).toISOString(),
        windWaveHeight:
          typeof data.windWaveHeight === "number"
            ? Number(data.windWaveHeight.toFixed(2))
            : null,
        surgeHeight:
          typeof data.surgeHeight === "number"
            ? Number(data.surgeHeight.toFixed(2))
            : null,
      }));
  }, [rawWaveData]);

  // 计算统计信息
  const stats = React.useMemo(() => {
    if (!waveData || waveData.length === 0) return null;

    const windWaveHeights = waveData
      .map((d) => d.windWaveHeight)
      .filter((h): h is number => h !== null);
    const surgeHeights = waveData
      .map((d) => d.surgeHeight)
      .filter((h): h is number => h !== null);

    if (windWaveHeights.length === 0 && surgeHeights.length === 0) return null;

    const windStats =
      windWaveHeights.length > 0
        ? {
            max: Math.max(...windWaveHeights),
            min: Math.min(...windWaveHeights),
            avg:
              windWaveHeights.reduce((a, b) => a + b, 0) /
              windWaveHeights.length,
            trend:
              windWaveHeights[windWaveHeights.length - 1] - windWaveHeights[0],
          }
        : null;

    const surgeStats =
      surgeHeights.length > 0
        ? {
            max: Math.max(...surgeHeights),
            min: Math.min(...surgeHeights),
            avg: surgeHeights.reduce((a, b) => a + b, 0) / surgeHeights.length,
            trend: surgeHeights[surgeHeights.length - 1] - surgeHeights[0],
          }
        : null;

    return { windStats, surgeStats };
  }, [waveData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>浪高变化</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>浪高变化</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          加载失败
        </CardContent>
      </Card>
    );
  }

  if (!waveData || waveData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>浪高变化</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          暂无浪高数据
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>浪高变化</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={waveData}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                format(new Date(value), "HH:mm", { locale: zhCN })
              }
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}m`}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="font-medium text-muted-foreground">
                          {format(new Date(label), "MM-dd HH:mm", {
                            locale: zhCN,
                          })}
                        </div>
                        {payload.map((entry) => (
                          <div
                            key={entry.dataKey}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: entry.color,
                              }}
                            />
                            <span className="font-bold">{entry.value} m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="natural"
              dataKey="windWaveHeight"
              name="风浪高度"
              stroke={chartConfig.windWaveHeight.theme.light}
              fill={chartConfig.windWaveHeight.theme.light}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                className: "stroke-background stroke-2",
              }}
              isAnimationActive={false}
              connectNulls={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <StatsCard
          title="风浪高度"
          stats={stats?.windStats ?? null}
          unit="m"
          color={chartConfig.windWaveHeight.theme.light}
          icon={Waves}
        />
      </CardFooter>
    </Card>
  );
}
