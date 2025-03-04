"use client";

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
import React from "react";

export interface BaseChartProps {
  data: any[];
  dataKey: string;
  color: string;
  fitColor?: string;
  unit?: string;
  name?: string;
  icon?: React.ElementType;
}

// 计算多项式回归拟合
function polynomialRegression(data: any[], field: string, degree: number = 20) {
  if (!data?.length) return [];

  // 将数据点转换为x和y数组，x为时间索引
  const x = data.map((_, i) => i);
  const y = data.map((d) => {
    const value = d[field];
    return value != null && !isNaN(value) ? value : 0;
  });

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
  fitColor = "#8884d8",
  unit = "",
  name = "",
  icon,
}: BaseChartProps) {
  const [showFit, setShowFit] = useState(true);
  const [showOriginal, setShowOriginal] = useState(true);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{
    x?: [string, string];
    y?: [number, number];
  }>({});

  // 计算 Y 轴范围
  const yAxisConfig = useMemo(() => {
    if (!data?.length) return { domain: [0, 0], ticks: [] };

    const values = data
      .map((d) => {
        const value = d[dataKey];
        return value != null && !isNaN(value) ? value : null;
      })
      .filter((v): v is number => v != null);

    if (!values.length) return { domain: [0, 0], ticks: [] };

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const padding = range * 0.1;

    const min = Math.floor((minValue - padding) * 10) / 10;
    const max = Math.ceil((maxValue + padding) * 10) / 10;

    const tickCount = Math.round((max - min) * 2) + 1;
    const ticks = Array.from(
      { length: tickCount },
      (_, i) => Math.round((min + i * 0.5) * 10) / 10
    );

    return { domain: [min, max] as [number, number], ticks };
  }, [data, dataKey]);

  // 处理鼠标事件
  const handleMouseDown = useCallback((e: any) => {
    if (e?.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: any) => {
      if (refAreaLeft && e?.activeLabel) {
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

      const values = selectedData
        .map((d) => {
          const value = d[dataKey];
          return value != null && !isNaN(value) ? value : null;
        })
        .filter((v): v is number => v != null);

      if (values.length) {
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const padding = (maxValue - minValue) * 0.05;

        setZoomDomain({
          x: [left, right],
          y: [minValue - padding, maxValue + padding],
        });
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, data, dataKey]);

  const handleResetZoom = useCallback(() => {
    setZoomDomain({});
  }, []);

  // 计算拟合数据
  const fittedData = useMemo(() => {
    if (!showFit) return data;
    return polynomialRegression(data, dataKey, 20);
  }, [data, dataKey, showFit]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon &&
            React.createElement(icon, {
              className: "h-4 w-4 text-muted-foreground",
            })}
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`showOriginal-${name}`}
              checked={showOriginal}
              onCheckedChange={(checked) => setShowOriginal(checked as boolean)}
            />
            <label
              htmlFor={`showOriginal-${name}`}
              className="text-sm font-medium"
            >
              原始曲线
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`showFit-${name}`}
              checked={showFit}
              onCheckedChange={(checked) => setShowFit(checked as boolean)}
            />
            <label htmlFor={`showFit-${name}`} className="text-sm font-medium">
              拟合曲线
            </label>
          </div>
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
              domain={zoomDomain.y || yAxisConfig.domain}
              ticks={yAxisConfig.ticks}
              allowDataOverflow
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
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
            {showOriginal && (
              <Line
                name={name}
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            )}
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
