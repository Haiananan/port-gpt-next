"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchPressureData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CoastalPressureChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

const chartConfig = {
  airPressure: {
    label: "气压",
    theme: {
      light: "hsl(var(--primary))",
      dark: "hsl(var(--primary))",
    },
  },
} satisfies ChartConfig;

export function CoastalPressureChart({
  station,
  startDate,
  endDate,
}: CoastalPressureChartProps) {
  const {
    data: pressureData,
    isLoading,
    error,
  } = useQuery({
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

  // 计算气压变化趋势
  const pressureTrend = React.useMemo(() => {
    if (!pressureData || pressureData.length < 2) return null;
    const firstPressure = pressureData[0].airPressure;
    const lastPressure = pressureData[pressureData.length - 1].airPressure;
    if (firstPressure === null || lastPressure === null) return null;
    const diff = lastPressure - firstPressure;
    return {
      value: Math.abs(diff).toFixed(1),
      isUp: diff > 0,
    };
  }, [pressureData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>气压变化</CardTitle>
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
          <CardTitle>气压变化</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          加载失败
        </CardContent>
      </Card>
    );
  }

  if (!pressureData || pressureData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>气压变化</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          暂无气压数据
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>气压变化</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={pressureData}
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
              domain={["dataMin - 1", "dataMax + 1"]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}hPa`}
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
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: "var(--color-airPressure)",
                            }}
                          />
                          <span className="font-bold">
                            {payload[0].value} hPa
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="natural"
              dataKey="airPressure"
              className="stroke-[var(--color-airPressure)] fill-[var(--color-airPressure)]/20"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                className:
                  "fill-[var(--color-airPressure)] stroke-background stroke-2",
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {pressureTrend && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            气压{pressureTrend.isUp ? "上升" : "下降"} {pressureTrend.value} hPa{" "}
            {pressureTrend.isUp ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            显示最近一段时间的气压变化趋势
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
