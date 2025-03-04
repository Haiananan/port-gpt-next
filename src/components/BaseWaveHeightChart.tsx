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

export interface WaveHeightChartProps {
  data: any[];
  dataKey: string;
  color: string;
  name: string;
}

// 基础浪高图表组件
export function BaseWaveHeightChart({
  data,
  dataKey,
  color,
  name,
}: WaveHeightChartProps) {
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
      const heights = selectedData.map((d) => d[dataKey] as number);
      const minHeight = Math.min(...heights);
      const maxHeight = Math.max(...heights);
      const padding = (maxHeight - minHeight) * 0.1;

      setZoomDomain({
        x: [left, right],
        y: [minHeight - padding, maxHeight + padding],
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
            tickFormatter={(value) => `${value}m`}
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
                            {entry.value?.toFixed(2)}m
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
            connectNulls={true}
          />
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
