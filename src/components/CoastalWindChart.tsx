"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWindData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { CoastalStationData } from "@/types/coastal";
import React from "react";

interface CoastalWindChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

interface WindDirectionData {
  direction: string;
  微风: number;
  轻风: number;
  和风: number;
  强风: number;
  大风: number;
  total: number;
  dominantSpeed: string;
  percentage: number;
  [key: string]: string | number;
}

// 将角度转换为方向文字
const getWindDirection = (angle: number) => {
  const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return directions[index];
};

// 获取点的颜色，根据风速大小
const getWindSpeedColor = (speed: number) => {
  if (speed < 2) return "hsl(142.1 76.2% 36.3%)"; // 微风
  if (speed < 5) return "hsl(221.2 83.2% 53.3%)"; // 轻风
  if (speed < 8) return "hsl(35.3 91.2% 51.6%)"; // 和风
  if (speed < 11) return "hsl(0 84.2% 60.2%)"; // 强风
  return "hsl(262.1 83.3% 57.8%)"; // 大风
};

// 风速等级说明
const WIND_LEVELS = [
  {
    name: "微风",
    range: "<2m/s",
    color: "hsl(142.1 76.2% 36.3%)",
    maxSpeed: 2,
  },
  {
    name: "轻风",
    range: "2-5m/s",
    color: "hsl(221.2 83.2% 53.3%)",
    maxSpeed: 5,
  },
  {
    name: "和风",
    range: "5-8m/s",
    color: "hsl(35.3 91.2% 51.6%)",
    maxSpeed: 8,
  },
  { name: "强风", range: "8-11m/s", color: "hsl(0 84.2% 60.2%)", maxSpeed: 11 },
  {
    name: "大风",
    range: ">11m/s",
    color: "hsl(262.1 83.3% 57.8%)",
    maxSpeed: Infinity,
  },
];

export function CoastalWindChart({
  station,
  startDate,
  endDate,
}: CoastalWindChartProps) {
  const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null);
  const [chartScale, setChartScale] = React.useState<number>(1);
  const [showPercentage, setShowPercentage] = React.useState<boolean>(false);

  const {
    data: windData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wind", station, startDate.toISOString(), endDate.toISOString()],
    queryFn: () =>
      fetchWindData(station, startDate.toISOString(), endDate.toISOString()),
  });

  // 处理数据，按风向分组并计算平均风速
  const processData = () => {
    if (!windData) return [];

    const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    const directionData: WindDirectionData[] = directions.map((dir) => ({
      direction: dir,
      微风: 0,
      轻风: 0,
      和风: 0,
      强风: 0,
      大风: 0,
      total: 0,
      dominantSpeed: "",
      percentage: 0,
    }));

    let totalRecords = 0;

    // 统计每个方向的风速分布
    windData
      .filter((item) => item.windDirection !== null && item.windSpeed !== null)
      .forEach((item) => {
        const dirIndex =
          Math.round(((item.windDirection! + 360) % 360) / 45) % 8;
        const speed = item.windSpeed!;
        totalRecords++;

        if (speed < 2) directionData[dirIndex]["微风"]++;
        else if (speed < 5) directionData[dirIndex]["轻风"]++;
        else if (speed < 8) directionData[dirIndex]["和风"]++;
        else if (speed < 11) directionData[dirIndex]["强风"]++;
        else directionData[dirIndex]["大风"]++;

        directionData[dirIndex].total++;
      });

    // 计算每个方向的主导风速和百分比
    directionData.forEach((data) => {
      data.percentage = (data.total / totalRecords) * 100;

      // 找出主导风速
      const speeds = WIND_LEVELS.map((level) => ({
        name: level.name,
        count: data[level.name] as number,
      }));
      data.dominantSpeed = speeds.reduce((a, b) =>
        (data[a.name] as number) > (data[b.name] as number) ? a : b
      ).name;
    });

    return directionData;
  };

  const chartData = processData();

  // 处理图表缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    setChartScale(Math.min(Math.max(0.5, chartScale + delta), 2));
  };

  // 计算风力等级总占比
  const windLevelStats = React.useMemo(() => {
    if (!chartData.length) return [];
    return WIND_LEVELS.map((level) => {
      const total = chartData.reduce(
        (sum, data) => sum + (data[level.name] as number),
        0
      );
      return {
        name: level.name,
        value: total,
        color: level.color,
        range: level.range,
      };
    });
  }, [chartData]);

  // 计算风向总占比
  const windDirectionStats = React.useMemo(() => {
    return chartData.map((data) => ({
      name: data.direction,
      value: data.total,
      color:
        WIND_LEVELS.find((l) => l.name === data.dominantSpeed)?.color || "#888",
    }));
  }, [chartData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>风向玫瑰图</CardTitle>
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
          <CardTitle>风向玫瑰图</CardTitle>
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
          <CardTitle>风向玫瑰图</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          暂无风向风速数据
        </CardContent>
      </Card>
    );
  }

  // 计算主导风向
  const dominantDirection = chartData.reduce((a, b) =>
    a.total > b.total ? a : b
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>风向玫瑰图</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            主导风向: {dominantDirection.direction} (
            {dominantDirection.dominantSpeed})
            {showPercentage && ` - ${dominantDirection.percentage.toFixed(1)}%`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPercentage}
              onChange={(e) => setShowPercentage(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            显示百分比
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 左侧风力等级饼图 */}
          <div className="lg:col-span-3 flex">
            <div className="rounded-lg border p-4 flex-1 flex flex-col">
              <h3 className="font-medium mb-2">风力等级分布</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={windLevelStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {windLevelStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = windLevelStats.reduce(
                            (sum, item) => sum + item.value,
                            0
                          );
                          const percentage = (
                            (data.value / total) *
                            100
                          ).toFixed(1);
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: data.color }}
                                />
                                <span className="font-medium">{data.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({data.range})
                                </span>
                              </div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {data.value}次 ({percentage}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {windLevelStats.map((level) => {
                  const total = windLevelStats.reduce(
                    (sum, item) => sum + item.value,
                    0
                  );
                  const percentage = ((level.value / total) * 100).toFixed(1);
                  return (
                    <div
                      key={level.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        <span>{level.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 中间风向玫瑰图 */}
          <div className="lg:col-span-6">
            <div className="rounded-lg border p-4">
              <div className="relative">
                <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                  <button
                    onClick={() =>
                      setChartScale(Math.max(0.5, chartScale - 0.1))
                    }
                    className="w-8 h-8 rounded-lg border bg-background hover:bg-accent flex items-center justify-center"
                    title="缩小"
                  >
                    <span className="text-lg">-</span>
                  </button>
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                    {(chartScale * 100).toFixed(0)}%
                  </span>
                  <button
                    onClick={() => setChartScale(Math.min(2, chartScale + 0.1))}
                    className="w-8 h-8 rounded-lg border bg-background hover:bg-accent flex items-center justify-center"
                    title="放大"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
                <div
                  className="h-[500px]"
                  onWheel={handleWheel}
                  style={{ cursor: "zoom-in" }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius={`${80 * chartScale}%`}
                      data={chartData}
                      margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
                    >
                      <PolarGrid gridType="circle" />
                      <PolarAngleAxis
                        dataKey="direction"
                        tick={{ fill: "hsl(var(--foreground))" }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, "auto"]}
                        tick={{ fill: "hsl(var(--foreground))" }}
                        tickFormatter={(value) =>
                          showPercentage
                            ? `${(
                                (value /
                                  chartData.reduce(
                                    (sum, d) => sum + d.total,
                                    0
                                  )) *
                                100
                              ).toFixed(1)}%`
                            : value.toString()
                        }
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0]
                              .payload as WindDirectionData;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>{data.direction}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {showPercentage
                                        ? `${data.percentage.toFixed(1)}%`
                                        : `${data.total}次`}
                                    </span>
                                  </div>
                                  {WIND_LEVELS.map((level) => (
                                    <div
                                      key={level.name}
                                      className="flex items-center justify-between gap-2"
                                      style={{
                                        opacity:
                                          selectedLevel &&
                                          selectedLevel !== level.name
                                            ? 0.5
                                            : 1,
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor: level.color,
                                          }}
                                        />
                                        <span>{level.name}</span>
                                      </div>
                                      <span>
                                        {showPercentage
                                          ? `${(
                                              ((data[level.name] as number) /
                                                data.total) *
                                              100
                                            ).toFixed(1)}%`
                                          : data[level.name]}
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
                      {WIND_LEVELS.map((level) => (
                        <Radar
                          key={level.name}
                          name={level.name}
                          dataKey={level.name}
                          stroke={level.color}
                          fill={level.color}
                          fillOpacity={
                            selectedLevel === level.name
                              ? 0.8
                              : selectedLevel
                              ? 0.2
                              : 0.6
                          }
                          isAnimationActive={false}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4 px-4 text-sm max-w-full overflow-hidden">
                  {WIND_LEVELS.map((level) => (
                    <div
                      key={level.name}
                      className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-200 whitespace-nowrap"
                      style={{
                        opacity:
                          selectedLevel && selectedLevel !== level.name
                            ? 0.5
                            : 1,
                      }}
                      onClick={() =>
                        setSelectedLevel(
                          selectedLevel === level.name ? null : level.name
                        )
                      }
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="text-xs">
                        {level.name} ({level.range})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧风向分布饼图 */}
          <div className="lg:col-span-3 flex">
            <div className="rounded-lg border p-4 flex-1 flex flex-col">
              <h3 className="font-medium mb-2">风向分布</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={windDirectionStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {windDirectionStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = windDirectionStats.reduce(
                            (sum, item) => sum + item.value,
                            0
                          );
                          const percentage = (
                            (data.value / total) *
                            100
                          ).toFixed(1);
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: data.color }}
                                />
                                <span className="font-medium">{data.name}</span>
                              </div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {data.value}次 ({percentage}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {windDirectionStats.map((direction) => {
                  const total = windDirectionStats.reduce(
                    (sum, item) => sum + item.value,
                    0
                  );
                  const percentage = ((direction.value / total) * 100).toFixed(
                    1
                  );
                  return (
                    <div
                      key={direction.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: direction.color }}
                        />
                        <span>{direction.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
