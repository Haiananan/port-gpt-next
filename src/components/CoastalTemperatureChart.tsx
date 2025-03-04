import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoastalStationData } from "@/types/coastal";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
  Brush,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, addHours, startOfHour, differenceInHours } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchTemperatureData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback, useMemo } from "react";

interface CoastalTemperatureChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

// 计算移动平均值
function calculateMovingAverage(data: any[], hours: number) {
  const result = [];
  const pointsPerWindow = hours;

  for (let i = 0; i < data.length; i++) {
    const startIdx = Math.max(0, i - pointsPerWindow + 1);
    const window = data.slice(startIdx, i + 1);
    const sum = window.reduce((acc, curr) => acc + curr.temperature, 0);
    const avg = sum / window.length;

    result.push({
      ...data[i],
      [`avg${hours}h`]: avg,
    });
  }

  return result;
}

export function CoastalTemperatureChart({
  station,
  startDate,
  endDate,
}: CoastalTemperatureChartProps) {
  // 用于区域选择缩放的状态
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  // 用于记录当前的缩放范围
  const [zoomDomain, setZoomDomain] = useState<{
    x?: [string, string];
    y?: [number, number];
  }>({});

  // 控制平均线的显示状态
  const [showAvg6h, setShowAvg6h] = useState(true);
  const [showAvg12h, setShowAvg12h] = useState(true);

  const { data, isLoading, error } = useQuery({
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

  // 处理数据，计算不同时间窗口的平均值
  const chartData = useMemo(() => {
    if (!data) return [];

    const baseData = data
      .filter((item) => item.airTemperature !== null)
      .map((item) => ({
        date: format(new Date(item.date), "MM-dd HH:mm", { locale: zhCN }),
        temperature: item.airTemperature,
        originalDate: new Date(item.date), // 保存原始日期用于排序
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // 计算不同时间窗口的移动平均值
    const with6hAvg = calculateMovingAverage(baseData, 6);
    const with12hAvg = calculateMovingAverage(baseData, 12);

    // 合并所有平均值
    return baseData.map((item, index) => ({
      ...item,
      avg6h: with6hAvg[index].avg6h,
      avg12h: with12hAvg[index].avg12h,
    }));
  }, [data]);

  // 处理鼠标按下事件，开始选择区域
  const handleMouseDown = useCallback((e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  }, []);

  // 处理鼠标移动事件，更新选择区域
  const handleMouseMove = useCallback(
    (e: any) => {
      if (refAreaLeft && e && e.activeLabel) {
        setRefAreaRight(e.activeLabel);
      }
    },
    [refAreaLeft]
  );

  // 处理鼠标抬起事件，完成区域选择
  const handleMouseUp = useCallback(() => {
    if (refAreaLeft && refAreaRight) {
      // 确保左边界小于右边界
      const [left, right] = [refAreaLeft, refAreaRight].sort();

      // 获取选中区域的温度范围
      const selectedData = chartData.filter(
        (entry) => entry.date >= left && entry.date <= right
      );
      const temperatures = selectedData.map((d) => d.temperature as number);
      const minTemp = Math.min(...temperatures);
      const maxTemp = Math.max(...temperatures);
      const padding = (maxTemp - minTemp) * 0.1;

      setZoomDomain({
        x: [left, right],
        y: [minTemp - padding, maxTemp + padding],
      });
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, chartData]);

  // 重置缩放
  const handleResetZoom = () => {
    setZoomDomain({});
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>气温变化趋势</CardTitle>
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
          <CardTitle>气温变化趋势</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          加载失败
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>气温变化趋势</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          暂无气温数据
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>气温变化趋势</CardTitle>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAvg6h}
              onChange={(e) => setShowAvg6h(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            6小时平均
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAvg12h}
              onChange={(e) => setShowAvg12h(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            12小时平均
          </label>
          {Object.keys(zoomDomain).length > 0 && (
            <button
              onClick={handleResetZoom}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              重置缩放
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
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
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°C`}
                domain={zoomDomain.y}
                allowDataOverflow
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
                              {payload[0].payload.date}
                            </span>
                          </div>
                          {payload.map((entry: any) => (
                            <div key={entry.dataKey} className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {entry.name}
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: entry.color }}
                              >
                                {entry.value.toFixed(1)}°C
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                name="实时温度"
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              {showAvg6h && (
                <Line
                  name="6小时平均"
                  type="monotone"
                  dataKey="avg6h"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="10 5"
                />
              )}
              {showAvg12h && (
                <Line
                  name="12小时平均"
                  type="monotone"
                  dataKey="avg12h"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="15 5"
                />
              )}
              {refAreaLeft && refAreaRight && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill="#2563eb"
                  fillOpacity={0.1}
                />
              )}
              <Brush
                dataKey="date"
                height={30}
                stroke="#2563eb"
                fill="var(--background)"
                tickFormatter={(value) => value}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
