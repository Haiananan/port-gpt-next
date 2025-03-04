"use client";

import * as React from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
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
import { fetchPressureData } from "@/services/coastalApi";
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
    if (!data) return null;
    return data.map((d) => ({
      date: new Date(d.date).toISOString(),
      airPressure: d.airPressure,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>气压变化</CardTitle>
        </CardHeader>
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
    <Card className="">
      <CardHeader>
        <CardTitle>气压变化</CardTitle>
        <CardDescription>
          {format(startDate, "MM-dd", { locale: zhCN })} 至{" "}
          {format(endDate, "MM-dd", { locale: zhCN })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="300px">
              <LineChart
                data={pressureData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    format(new Date(value), "HH:mm", { locale: zhCN })
                  }
                />
                <YAxis tickFormatter={(value) => `${value}hPa`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  name="气压"
                  type="monotone"
                  dataKey="airPressure"
                  className="stroke-primary"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
