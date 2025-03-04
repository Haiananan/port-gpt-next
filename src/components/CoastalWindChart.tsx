import {
  CartesianGrid,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { fetchWindData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { CoastalStationData } from "@/types/coastal";

interface CoastalWindChartProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

// 将角度转换为方向文字
const getWindDirection = (angle: number) => {
  const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return directions[index];
};

// 获取点的颜色，根据风速大小
const getWindSpeedColor = (speed: number) => {
  if (speed < 2) return "#22c55e"; // 微风
  if (speed < 5) return "#3b82f6"; // 轻风
  if (speed < 8) return "#f59e0b"; // 和风
  if (speed < 11) return "#ef4444"; // 强风
  return "#7c3aed"; // 大风
};

export function CoastalWindChart({
  station,
  startDate,
  endDate,
}: CoastalWindChartProps) {
  const {
    data: windData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wind", station, startDate.toISOString(), endDate.toISOString()],
    queryFn: () =>
      fetchWindData(station, startDate.toISOString(), endDate.toISOString()),
  });

  // 处理数据，转换为图表所需格式
  const chartData =
    windData
      ?.filter((item) => item.windDirection !== null && item.windSpeed !== null)
      .map((item) => {
        // 将风向角度转换为弧度（0度指向北方，顺时针旋转）
        const angleRad = ((90 - item.windDirection!) * Math.PI) / 180;
        return {
          date: format(new Date(item.date), "MM-dd HH:mm", { locale: zhCN }),
          windDirection: item.windDirection!,
          windSpeed: item.windSpeed!,
          // 计算在笛卡尔坐标系中的位置
          x: item.windSpeed! * Math.cos(angleRad),
          y: item.windSpeed! * Math.sin(angleRad),
          // 获取点的颜色
          fill: getWindSpeedColor(item.windSpeed!),
        };
      }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>风向风速图</CardTitle>
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
          <CardTitle>风向风速图</CardTitle>
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
          <CardTitle>风向风速图</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          暂无风向风速数据
        </CardContent>
      </Card>
    );
  }

  // 计算最大风速，用于设置坐标轴范围
  const maxWindSpeed = Math.max(...chartData.map((d) => d.windSpeed));
  const axisRange = [-maxWindSpeed, maxWindSpeed];

  return (
    <Card>
      <CardHeader>
        <CardTitle>风向风速图</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={axisRange}
                tickFormatter={(value) => `${Math.abs(value)}m/s`}
                label={{ value: "东 ←   → 西", position: "bottom" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={axisRange}
                tickFormatter={(value) => `${Math.abs(value)}m/s`}
                label={{ value: "南 ←   → 北", angle: -90, position: "left" }}
              />
              <Scatter data={chartData} shape="circle" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <circle
                    key={`dot-${index}`}
                    cx={0}
                    cy={0}
                    r={3}
                    fill={entry.fill}
                  />
                ))}
              </Scatter>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              时间
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {data.date}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              风向
                            </span>
                            <span className="font-bold">
                              {getWindDirection(data.windDirection)}
                              {` (${data.windDirection}°)`}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              风速
                            </span>
                            <span className="font-bold">
                              {data.windSpeed} m/s
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                content={() => (
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                      <span className="text-sm">微风 (&lt;2m/s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                      <span className="text-sm">轻风 (2-5m/s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                      <span className="text-sm">和风 (5-8m/s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                      <span className="text-sm">强风 (8-11m/s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#7c3aed]" />
                      <span className="text-sm">大风 (&gt;11m/s)</span>
                    </div>
                  </div>
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
