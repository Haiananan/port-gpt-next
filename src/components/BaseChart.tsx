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
import { useState, useCallback } from "react";

export interface BaseChartProps {
  data: any[];
  dataKey: string;
  color: string;
  showAvg6h: boolean;
  showAvg12h: boolean;
  onAvg6hChange: (checked: boolean) => void;
  onAvg12hChange: (checked: boolean) => void;
  avg6hColor: string;
  avg12hColor: string;
  unit?: string;
  name?: string;
  yAxisDomain?: [number, number];
  yAxisTicks?: number[];
}

// 计算移动平均值
export function calculateMovingAverage(
  data: any[],
  hours: number,
  field: string
) {
  const result = [];
  const pointsPerWindow = hours;

  for (let i = 0; i < data.length; i++) {
    const startIdx = Math.max(0, i - pointsPerWindow + 1);
    const window = data.slice(startIdx, i + 1);
    const sum = window.reduce((acc, curr) => acc + (curr[field] || 0), 0);
    const avg = sum / window.length;

    result.push({
      ...data[i],
      [`${field}Avg${hours}h`]: avg,
    });
  }

  return result;
}

// 基础图表组件
export function BaseChart({
  data,
  dataKey,
  color,
  showAvg6h,
  showAvg12h,
  onAvg6hChange,
  onAvg12hChange,
  avg6hColor,
  avg12hColor,
  unit = "",
  name,
  yAxisDomain,
  yAxisTicks,
}: BaseChartProps) {
  // 用于区域选择缩放的状态
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  // 用于记录当前的缩放范围
  const [zoomDomain, setZoomDomain] = useState<{
    x?: [string, string];
    y?: [number, number];
  }>({});

  // 处理鼠标事件
  const handleMouseDown = useCallback((e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: any) => {
      if (refAreaLeft && e && e.activeLabel) {
        setRefAreaRight(e.activeLabel);
      }
    },
    [refAreaLeft]
  );

  const handleMouseUp = useCallback(() => {
    if (refAreaLeft && refAreaRight) {
      const [left, right] = [refAreaLeft, refAreaRight].sort();
      const selectedData = data.filter(
        (entry) => entry.date >= left && entry.date <= right
      );
      const values = selectedData.map((d) => d[dataKey] as number);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const padding = (maxValue - minValue) * 0.05;

      setZoomDomain({
        x: [left, right],
        y: [minValue - padding, maxValue + padding],
      });
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, data, dataKey]);

  const handleResetZoom = () => {
    setZoomDomain({});
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
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
            tickFormatter={(value) => `${value}${unit}`}
            domain={zoomDomain.y || yAxisDomain || ["auto", "auto"]}
            ticks={yAxisTicks}
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
                            {entry.value?.toFixed(1)}
                            {unit}
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
            name={name}
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
          {showAvg6h && (
            <Line
              name="6小时平均"
              type="monotone"
              dataKey={`${dataKey}Avg6h`}
              stroke={avg6hColor}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="10 5"
            />
          )}
          {showAvg12h && (
            <Line
              name="12小时平均"
              type="monotone"
              dataKey={`${dataKey}Avg12h`}
              stroke={avg12hColor}
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
              fill={color}
              fillOpacity={0.1}
            />
          )}
          <Brush
            dataKey="date"
            height={30}
            stroke={color}
            fill="var(--background)"
            tickFormatter={(value) => value}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
