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
import { useState, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  fitColor?: string;
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

// 计算多项式回归拟合
function polynomialRegression(data: any[], field: string, degree: number = 20) {
  // 将数据点转换为x和y数组，x为时间索引
  const x = data.map((_, i) => i);
  const y = data.map((d) => d[field] || 0);

  // 构建矩阵A
  const A: number[][] = [];
  for (let i = 0; i < x.length; i++) {
    const row: number[] = [];
    for (let j = 0; j <= degree; j++) {
      row.push(Math.pow(x[i], j));
    }
    A.push(row);
  }

  // 使用最小二乘法求解系数
  const AT = A[0].map((_: number, i: number) => A.map((row) => row[i])); // 转置
  const ATA = AT.map((row) => {
    return A[0].map((_: number, j: number) => {
      return row.reduce((sum, val, k) => sum + val * A[k][j], 0);
    });
  });
  const ATy = AT.map((row) => row.reduce((sum, val, i) => sum + val * y[i], 0));

  // 高斯消元求解
  const coefficients = gaussianElimination(ATA, ATy);

  // 生成拟合数据点
  return data.map((point, i) => ({
    ...point,
    [`${field}Fit`]: coefficients.reduce(
      (sum, coef, power) => sum + coef * Math.pow(i, power),
      0
    ),
  }));
}

// 高斯消元法
function gaussianElimination(A: number[][], b: number[]) {
  const n = A.length;
  const augmentedMatrix = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // 找到当前列最大元素
    let maxEl = Math.abs(augmentedMatrix[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmentedMatrix[k][i]) > maxEl) {
        maxEl = Math.abs(augmentedMatrix[k][i]);
        maxRow = k;
      }
    }

    // 交换最大行到当前行
    [augmentedMatrix[i], augmentedMatrix[maxRow]] = [
      augmentedMatrix[maxRow],
      augmentedMatrix[i],
    ];

    // 消元
    for (let k = i + 1; k < n; k++) {
      const c = -augmentedMatrix[k][i] / augmentedMatrix[i][i];
      for (let j = i; j <= n; j++) {
        if (i === j) {
          augmentedMatrix[k][j] = 0;
        } else {
          augmentedMatrix[k][j] += c * augmentedMatrix[i][j];
        }
      }
    }
  }

  // 回代
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmentedMatrix[i][n] / augmentedMatrix[i][i];
    for (let k = i - 1; k >= 0; k--) {
      augmentedMatrix[k][n] -= augmentedMatrix[k][i] * x[i];
    }
  }

  return x;
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
  fitColor = "#8884d8",
  unit = "",
  name,
  yAxisDomain,
  yAxisTicks,
}: BaseChartProps) {
  const [showFit, setShowFit] = useState(false);
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

  // 计算6小时平均值
  const avg6hData = useMemo(() => {
    if (!showAvg6h) return data;
    const result = [];
    const hours = 6;
    const pointsPerWindow = hours;

    for (let i = 0; i < data.length; i++) {
      const startIdx = Math.max(0, i - pointsPerWindow + 1);
      const window = data.slice(startIdx, i + 1);
      const sum = window.reduce((acc, curr) => acc + (curr[dataKey] || 0), 0);
      const avg = sum / window.length;

      result.push({
        ...data[i],
        [`${dataKey}Avg6h`]: avg,
      });
    }
    return result;
  }, [data, dataKey, showAvg6h]);

  // 计算12小时平均值
  const avg12hData = useMemo(() => {
    if (!showAvg12h) return avg6hData;
    const result = [];
    const hours = 12;
    const pointsPerWindow = hours;

    for (let i = 0; i < data.length; i++) {
      const startIdx = Math.max(0, i - pointsPerWindow + 1);
      const window = data.slice(startIdx, i + 1);
      const sum = window.reduce((acc, curr) => acc + (curr[dataKey] || 0), 0);
      const avg = sum / window.length;

      result.push({
        ...avg6hData[i],
        [`${dataKey}Avg12h`]: avg,
      });
    }
    return result;
  }, [avg6hData, data, dataKey, showAvg12h]);

  // 计算拟合数据
  const fittedData = useMemo(() => {
    if (!showFit) return avg12hData;
    return polynomialRegression(avg12hData, dataKey, 20);
  }, [avg12hData, dataKey, showFit]);

  return (
    <div className="space-y-2">
      <div className="flex justify-center items-center  w-full space-x-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="avg6h"
            checked={showAvg6h}
            onCheckedChange={(checked) => onAvg6hChange(checked as boolean)}
          />
          <Label htmlFor="avg6h" className="text-sm text-muted-foreground">
            6小时平均
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="avg12h"
            checked={showAvg12h}
            onCheckedChange={(checked) => onAvg12hChange(checked as boolean)}
          />
          <Label htmlFor="avg12h" className="text-sm text-muted-foreground">
            12小时平均
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="showFit"
            checked={showFit}
            onCheckedChange={(checked) => setShowFit(checked as boolean)}
          />
          <Label htmlFor="showFit" className="text-sm text-muted-foreground">
            拟合曲线
          </Label>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={fittedData}
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
            {showFit && (
              <Line
                name="拟合曲线"
                type="monotone"
                dataKey={`${dataKey}Fit`}
                stroke={fitColor}
                strokeWidth={2}
                dot={false}
                strokeDasharray="3 3"
              />
            )}
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
    </div>
  );
}
