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
  Scatter,
} from "recharts";
import { useState, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  RotateCcw,
  BarChart3,
  Eye,
  HelpCircle,
  LineChart as LineChartIcon,
  AlertTriangle,
  Activity,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toPng } from "html-to-image";
import * as XLSX from "xlsx";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface BaseChartProps {
  data: any[];
  dataKey: string;
  color: string;
  fitColor?: string;
  unit?: string;
  name?: string;
  icon?: React.ElementType;
  predictionDays?: number;
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
    return A[0].map((_, j: number) => {
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

// 计算统计信息
const getStats = (
  data: any[],
  key: string,
  startDate?: string,
  endDate?: string
) => {
  if (!data?.length) return null;

  // 根据日期范围过滤数据
  const filteredData =
    startDate && endDate
      ? data.filter((d) => d.date >= startDate && d.date <= endDate)
      : data;

  const values = filteredData
    .map((d) => d[key])
    .filter((v) => v != null && !isNaN(v) && typeof v === "number");

  if (!values.length) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const current = values[values.length - 1];

  // 计算标准差
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
  );

  // 检测异常值 (超过3个标准差)
  const anomalies = filteredData.filter((d) => {
    const value = d[key];
    return value != null && !isNaN(value) && Math.abs(value - avg) > 3 * stdDev;
  });

  return {
    max,
    min,
    avg,
    current,
    trend: current > values[0] ? "up" : "down",
    count: values.length,
    total: data.length,
    stdDev,
    anomalyCount: anomalies.length,
    anomalies: anomalies.map((d) => ({
      date: d.date,
      value: d[key],
      deviation: ((d[key] - avg) / stdDev).toFixed(2),
    })),
  };
};

// 计算预测趋势线
function calculateTrendLine(
  data: any[],
  field: string,
  predictionDays?: number
) {
  if (!data?.length) return [];

  // 计算数据时间跨度并设置预测天数为50%
  const firstDate = new Date(data[0].date);
  const lastDate = new Date(data[data.length - 1].date);
  const daysDiff = Math.ceil(
    (lastDate.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  const actualPredictionDays = predictionDays || Math.ceil(daysDiff * 0.5);

  // 将数据转换为坐标点，使用时间戳作为 x 值
  const points = data.map((d) => ({
    x: new Date(d.date).getTime(),
    y: d[field] || 0,
    date: d.date,
  }));

  // 标准化 x 值以避免数值过大
  const minX = points[0].x;
  const maxX = points[points.length - 1].x;
  const normalizedPoints = points.map((p) => ({
    x: (p.x - minX) / (60 * 60 * 1000), // 转换为小时数
    y: p.y,
    date: p.date,
  }));

  // 使用多项式回归进行预测
  const degree = 3; // 使用3次多项式
  const n = normalizedPoints.length;

  // 构建矩阵A
  const A: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j <= degree; j++) {
      row.push(Math.pow(normalizedPoints[i].x, j));
    }
    A.push(row);
  }

  // 构建向量b
  const b = normalizedPoints.map((p) => p.y);

  // 使用最小二乘法求解系数
  const AT = A[0].map((_, i) => A.map((row) => row[i])); // 转置
  const ATA = AT.map((row) => {
    return A[0].map((_, j) => {
      return row.reduce((sum, val, k) => sum + val * A[k][j], 0);
    });
  });
  const ATb = AT.map((row) => row.reduce((sum, val, i) => sum + val * b[i], 0));

  // 求解系数
  const coefficients = gaussianElimination(ATA, ATb);

  // 计算预测的标准误差
  const errors = normalizedPoints.map((point) => {
    const predicted = coefficients.reduce(
      (sum, coef, power) => sum + coef * Math.pow(point.x, power),
      0
    );
    return (point.y - predicted) ** 2;
  });
  const standardError = Math.sqrt(
    errors.reduce((a, b) => a + b, 0) / (n - degree - 1)
  );

  // 生成趋势线数据，包括预测部分
  const trendData = [...data];
  const lastX = (maxX - minX) / (60 * 60 * 1000);

  // 添加预测点（每小时一个点）
  const totalPredictionHours = actualPredictionDays * 24;
  for (let i = 1; i <= totalPredictionHours; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setHours(nextDate.getHours() + i);
    const dateStr = nextDate.toISOString().split(".")[0].replace("T", " ");
    const x = lastX + i;

    // 计算预测值
    const predictedValue = coefficients.reduce(
      (sum, coef, power) => sum + coef * Math.pow(x, power),
      0
    );

    // 计算95%置信区间
    const confidenceInterval =
      1.96 *
      standardError *
      Math.sqrt(
        1 +
          1 / n +
          Math.pow(
            x - normalizedPoints.reduce((sum, p) => sum + p.x, 0) / n,
            2
          ) /
            normalizedPoints.reduce(
              (sum, p) =>
                sum +
                Math.pow(
                  p.x - normalizedPoints.reduce((s, q) => s + q.x, 0) / n,
                  2
                ),
              0
            )
      );

    trendData.push({
      date: dateStr,
      [`${field}Trend`]: predictedValue,
      [`${field}TrendUpper`]: predictedValue + confidenceInterval,
      [`${field}TrendLower`]: predictedValue - confidenceInterval,
      isPrediction: true,
    });
  }

  // 为所有点添加趋势线值
  return trendData.map((d) => {
    if (d.isPrediction) return d;
    const x = (new Date(d.date).getTime() - minX) / (60 * 60 * 1000);
    const predictedValue = coefficients.reduce(
      (sum, coef, power) => sum + coef * Math.pow(x, power),
      0
    );
    return {
      ...d,
      [`${field}Trend`]: predictedValue,
    };
  });
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
  predictionDays = 7,
}: BaseChartProps) {
  if (typeof window === "undefined") {
    return null;
  }

  const [showFit, setShowFit] = useState(true);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showTrend, setShowTrend] = useState(false);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [zoomDomain, setZoomDomain] = useState<{
    x?: [string, string];
    y?: [number, number];
  }>({});

  // 计算拟合数据
  const fittedData = useMemo(() => {
    if (!showFit) return data;
    return polynomialRegression(data, dataKey, 20);
  }, [data, dataKey, showFit]);

  // 计算趋势线数据
  const trendData = useMemo(() => {
    if (!showTrend) return fittedData;
    const trendLineData = calculateTrendLine(data, dataKey, predictionDays);

    // 合并拟合数据和趋势数据
    const mergedData = fittedData.map((point) => {
      const trendPoint = trendLineData.find((p) => p.date === point.date);
      return {
        ...point,
        [`${dataKey}Trend`]: trendPoint?.[`${dataKey}Trend`],
        [`${dataKey}TrendUpper`]: trendPoint?.[`${dataKey}TrendUpper`],
        [`${dataKey}TrendLower`]: trendPoint?.[`${dataKey}TrendLower`],
      };
    });

    // 只添加预测部分的数据点
    const predictionData = trendLineData.filter((p) => p.isPrediction);
    return [...mergedData, ...predictionData];
  }, [data, dataKey, showTrend, fittedData, predictionDays]);

  // 计算 Y 轴范围
  const yAxisConfig = useMemo(() => {
    if (!data?.length) return { domain: [0, 0], ticks: [] };

    const allValues = trendData
      .map((d) => {
        const values = [
          d[dataKey],
          d[`${dataKey}Trend`],
          d[`${dataKey}TrendUpper`],
          d[`${dataKey}TrendLower`],
        ].filter((v) => v != null && !isNaN(v));
        return values;
      })
      .flat()
      .filter((v): v is number => v != null);

    if (!allValues.length) return { domain: [0, 0], ticks: [] };

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
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
  }, [data, dataKey, trendData]);

  // 计算统计数据
  const stats = useMemo(() => {
    const [start, end] = zoomDomain.x || [];
    return getStats(data, dataKey, start, end);
  }, [data, dataKey, zoomDomain]);

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

  // 计算 X 轴范围
  const xAxisDomain = useMemo(() => {
    if (!showTrend || !data.length) return zoomDomain.x;

    const startDate = data[0].date;
    const lastDate = data[data.length - 1].date;
    const endDate = new Date(lastDate);
    endDate.setDate(endDate.getDate() + predictionDays);

    return zoomDomain.x || [startDate, endDate.toISOString().split("T")[0]];
  }, [data, showTrend, zoomDomain.x, predictionDays]);

  // 导出图表为图片
  const handleExportChart = useCallback(() => {
    const chartElement = document.querySelector(
      `#chart-${name}`
    ) as HTMLElement;
    if (!chartElement) return;

    toPng(chartElement, { quality: 1 })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${name}-图表.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("导出图表失败:", error);
      });
  }, [name]);

  // 导出数据为CSV/Excel
  const handleExportData = useCallback(
    (format: "csv" | "excel") => {
      const headers = ["日期", name, "拟合值"];
      const rows = fittedData.map((d) => [
        d.date,
        d[dataKey],
        d[`${dataKey}Fit`],
      ]);

      if (format === "csv") {
        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${name}-数据.csv`;
        link.click();
      } else {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);
        XLSX.writeFile(wb, `${name}-数据.xlsx`);
      }
    },
    [fittedData, dataKey, name]
  );

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
            <TooltipProvider delayDuration={100}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showOriginal ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="flex items-center gap-2"
                  >
                    <LineChartIcon className="h-4 w-4" />
                    原始曲线
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] p-2">
                  <p className="text-sm">
                    显示原始数据的时间序列曲线。
                    <br />
                    <br />
                    特点： 1. 保留数据的真实波动 2. 直观反映数据变化 3.
                    可用于识别突发事件
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={100}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showAnomalies ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAnomalies(!showAnomalies)}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    异常点
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] p-2">
                  <p className="text-sm">
                    使用统计方法识别异常数据点。
                    <br />
                    <br />
                    检测算法： 1. 计算移动平均(μ)和标准差(σ) 2. 计算Z分数：z =
                    (x-μ)/σ 3. 当|z| &gt; 3时判定为异常 4.
                    动态调整阈值适应数据特征
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={100}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showFit ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFit(!showFit)}
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    拟合曲线
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] p-2">
                  <p className="text-sm">
                    采用高阶多项式回归拟合数据。
                    <br />
                    <br />
                    技术细节： 1. 20阶多项式模型 2. 最小二乘法优化系数 3.
                    高斯消元求解方程组 4. 自适应权重平滑处理
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={100}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showStats ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-2"
                  >
                    <BarChart2 className="h-4 w-4" />
                    统计信息
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] p-2">
                  <p className="text-sm">
                    展示关键统计指标分析。
                    <br />
                    <br />
                    包含指标： 1. 最大/最小/平均值 2. 标准差和变异系数 3.
                    数据完整度统计 4. 趋势变化分析
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={100}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showTrend ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowTrend(!showTrend)}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    预测趋势
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] p-2">
                  <p className="text-sm">
                    基于多项式回归的趋势预测。
                    <br />
                    <br />
                    预测特点： 1. 3次多项式模型拟合 2. 95%置信区间估计 3.
                    考虑历史数据权重 4. 自动调整预测时长
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>

          <div className="h-full w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className={
              Object.keys(zoomDomain).length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
            disabled={Object.keys(zoomDomain).length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重置范围
          </Button>

          <div className="h-full w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportChart}>
                导出为图片 (PNG)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("csv")}>
                导出为 CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("excel")}>
                导出为 Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {stats && showStats && (
        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-muted rounded-lg">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">最大值</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {stats.max.toFixed(1)}
                {unit}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">最小值</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {stats.min.toFixed(1)}
                {unit}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">平均值</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {stats.avg.toFixed(1)}
                {unit}
              </span>
              <span className="text-xs text-muted-foreground">
                ({stats.count}/{stats.total}个数据点)
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">当前值</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {stats.current.toFixed(1)}
                {unit}
              </span>
              <span
                className={`text-sm ${
                  stats.trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {stats.trend === "up" ? "↑" : "↓"}
              </span>
            </div>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-sm text-muted-foreground">异常检测</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-orange-500">
                {stats.anomalyCount}
              </span>
              <span className="text-sm text-muted-foreground">
                个异常点 (超过3σ)
              </span>
              {stats.anomalyCount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  最近异常: {stats.anomalies[stats.anomalies.length - 1]?.date}(
                  {stats.anomalies[stats.anomalies.length - 1]?.value.toFixed(
                    1
                  )}
                  {unit},
                  {stats.anomalies[stats.anomalies.length - 1]?.deviation}σ)
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-sm text-muted-foreground">标准差</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {stats.stdDev.toFixed(2)}
                {unit}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="h-[300px]" id={`chart-${name}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
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
              domain={xAxisDomain}
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
                dot={(props: any) => {
                  const isAnomaly =
                    showAnomalies &&
                    stats?.anomalies?.some(
                      (a) => a.date === props.payload.date
                    );
                  if (isAnomaly) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill="#ef4444"
                        stroke="none"
                      />
                    );
                  }
                  return <circle cx={props.cx} cy={props.cy} r={0} />;
                }}
              />
            )}
            {showAnomalies && (
              <Scatter
                name="异常点"
                data={stats?.anomalies || []}
                fill="#ef4444"
                line={false}
                shape="circle"
                dataKey="value"
                xAxisId={0}
                yAxisId={0}
                legendType="circle"
                r={4}
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
            {showTrend && (
              <Line
                name="预测趋势"
                type="monotone"
                dataKey={`${dataKey}Trend`}
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
            {showTrend && (
              <Line
                name="置信区间上限"
                type="monotone"
                dataKey={`${dataKey}TrendUpper`}
                stroke="#10b981"
                strokeWidth={8}
                dot={false}
                strokeDasharray="3 3"
                opacity={0.3}
              />
            )}
            {showTrend && (
              <Line
                name="置信区间下限"
                type="monotone"
                dataKey={`${dataKey}TrendLower`}
                stroke="#10b981"
                strokeWidth={8}
                dot={false}
                strokeDasharray="3 3"
                opacity={0.3}
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
