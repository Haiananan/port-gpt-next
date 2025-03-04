"use client";

import * as React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWaveData } from "@/services/coastalApi";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CoastalWavePeriodChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

const chartConfig = {
  wavePeriod: {
    label: "浪周期",
    theme: {
      light: "hsl(var(--primary))",
      dark: "hsl(var(--primary))",
    },
  },
} satisfies ChartConfig;

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

  const waveData = React.useMemo(() => {
    if (!data) return null;
    return data.map((d) => ({
      date: new Date(d.date).toISOString(),
      wavePeriod: d.windWavePeriod,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>浪周期变化</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            加载中...
          </div>
        </CardContent>
      </Card>
    );
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
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={waveData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-border [&_.recharts-cartesian-grid-vertical_line]:stroke-border"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  className="stroke-muted/50"
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    format(new Date(value), "HH:mm", { locale: zhCN })
                  }
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}s`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  name="浪周期"
                  type="monotone"
                  dataKey="wavePeriod"
                  className="stroke-primary fill-primary/20"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    className: "fill-primary stroke-background stroke-2",
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
