import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchTemperatureData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import {
  BaseTemperatureChart,
  calculateMovingAverage,
} from "./BaseTemperatureChart";

// 气温图表组件
function AirTemperatureChart({ data }: { data: any[] }) {
  const [showAvg6h, setShowAvg6h] = useState(false);
  const [showAvg12h, setShowAvg12h] = useState(false);

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>气温变化趋势</CardTitle>
        <div className="flex items-center gap-2">
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
        </div>
      </CardHeader>
      <CardContent>
        <BaseTemperatureChart
          data={data}
          dataKey="airTemperature"
          color="#2563eb"
          showAvg6h={showAvg6h}
          showAvg12h={showAvg12h}
          onAvg6hChange={setShowAvg6h}
          onAvg12hChange={setShowAvg12h}
          avg6hColor="#f59e0b"
          avg12hColor="#ef4444"
        />
      </CardContent>
    </Card>
  );
}

// 海温图表组件
function SeaTemperatureChart({ data }: { data: any[] }) {
  const [showAvg6h, setShowAvg6h] = useState(false);
  const [showAvg12h, setShowAvg12h] = useState(false);

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>海温变化趋势</CardTitle>
        <div className="flex items-center gap-2">
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
        </div>
      </CardHeader>
      <CardContent>
        <BaseTemperatureChart
          data={data}
          dataKey="seaTemperature"
          color="#06b6d4"
          showAvg6h={showAvg6h}
          showAvg12h={showAvg12h}
          onAvg6hChange={setShowAvg6h}
          onAvg12hChange={setShowAvg12h}
          avg6hColor="#0891b2"
          avg12hColor="#0e7490"
        />
      </CardContent>
    </Card>
  );
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
        endDate.toISOString(),
        ["date", "airTemperature", "seaTemperature"]
      ),
  });

  // 处理数据，计算不同时间窗口的平均值
  const chartData = useMemo(() => {
    if (!data) return [];

    const baseData = data
      .filter(
        (item) => item.airTemperature !== null || item.seaTemperature !== null
      )
      .map((item) => ({
        date: format(new Date(item.date), "MM-dd HH:mm", { locale: zhCN }),
        airTemperature: item.airTemperature,
        seaTemperature: item.seaTemperature,
        originalDate: new Date(item.date),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    // 计算不同时间窗口的移动平均值
    let processedData = baseData;

    // 计算气温的移动平均
    const withAirTemp6hAvg = calculateMovingAverage(
      processedData,
      6,
      "airTemperature"
    );
    const withAirTemp12hAvg = calculateMovingAverage(
      processedData,
      12,
      "airTemperature"
    );

    // 计算海温的移动平均
    const withSeaTemp6hAvg = calculateMovingAverage(
      processedData,
      6,
      "seaTemperature"
    );
    const withSeaTemp12hAvg = calculateMovingAverage(
      processedData,
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
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>气温变化趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>海温变化趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>温度变化趋势</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          加载失败
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>温度变化趋势</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          暂无温度数据
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AirTemperatureChart data={chartData} />
      <SeaTemperatureChart data={chartData} />
    </div>
  );
}
