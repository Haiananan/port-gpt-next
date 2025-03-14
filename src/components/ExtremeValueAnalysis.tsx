import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Calculator } from "lucide-react";
import * as XLSX from "xlsx";

interface ExtremeValueAnalysisProps {
  data: any[];
  dataKey: string;
  unit: string;
  title: string;
  color: string;
}

// 按年或月分组数据
const groupDataByPeriod = (
  data: any[],
  period: "year" | "month",
  dataKey: string
) => {
  if (!data || data.length === 0) return [];

  const groupedData: { [key: string]: number[] } = {};

  data.forEach((item) => {
    if (item.date && item[dataKey] !== undefined && item[dataKey] !== null) {
      const date = new Date(item.date);
      const key =
        period === "year"
          ? date.getFullYear().toString()
          : `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item[dataKey]);
    }
  });

  return groupedData;
};

// 计算皮尔逊III型分布参数
const calculatePearsonTypeIIIParams = (extremeValues: number[]) => {
  // 样本数量
  const n = extremeValues.length;
  if (n < 3) return null;

  // 计算均值
  const mean = extremeValues.reduce((sum, val) => sum + val, 0) / n;

  // 计算样本方差和标准差
  const variance =
    extremeValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // 计算偏态系数
  const skewness =
    extremeValues.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) /
    (n * Math.pow(stdDev, 3));

  return { mean, stdDev, skewness, n };
};

// 计算特定频率对应的皮尔逊III型分布值
const calculatePearsonTypeIIIValue = (
  params: { mean: number; stdDev: number; skewness: number },
  frequency: number
) => {
  const { mean, stdDev, skewness } = params;

  // 计算经验频率
  const p = frequency; // P = m/(n+1)，这里直接使用输入的频率

  // 计算标准正态变量
  const z = -Math.log(-Math.log(1 - p)); // Gumbel reduced variate

  // 根据偏态系数调整频率因子
  let K;
  if (Math.abs(skewness) < 0.001) {
    // 无偏态，使用标准正态分布
    K = z;
  } else {
    // 使用改进的Pearson Type III近似公式
    const Cs = skewness;
    K =
      z +
      (Cs / 6) * (z * z - 1) +
      ((Cs * Cs) / 36) * (z * z * z - 6 * z) +
      ((Cs * Cs * Cs) / 216) * (2 * z * z * z - 9 * z);
  }

  // 计算皮尔逊III型分布值
  return mean + K * stdDev;
};

// 计算环境荷载 (简化公式)
const calculateEnvironmentalLoad = (
  extremeValue: number,
  type: "wave" | "wind" | "current"
) => {
  // 根据不同的环境因素使用不同的计算公式
  switch (type) {
    case "wave":
      // 波浪荷载 (简化): F = 0.5 * ρ * g * H^2 * D
      // 其中 ρ 是水密度, g 是重力加速度, H 是波高, D 是结构物直径
      // 此处假设 ρ=1025 kg/m³, g=9.81 m/s², D=1 m
      return 0.5 * 1025 * 9.81 * Math.pow(extremeValue, 2) * 1;

    case "wind":
      // 风荷载 (简化): F = 0.5 * ρ * Cd * A * V^2
      // 其中 ρ 是空气密度, Cd 是阻力系数, A 是迎风面积, V 是风速
      // 此处假设 ρ=1.225 kg/m³, Cd=1.2, A=1 m²
      return 0.5 * 1.225 * 1.2 * 1 * Math.pow(extremeValue, 2);

    case "current":
      // 流荷载 (简化): F = 0.5 * ρ * Cd * A * V^2
      // 其中 ρ 是水密度, Cd 是阻力系数, A 是迎流面积, V 是流速
      // 此处假设 ρ=1025 kg/m³, Cd=1.0, A=1 m²
      return 0.5 * 1025 * 1.0 * 1 * Math.pow(extremeValue, 2);

    default:
      return 0;
  }
};

export function ExtremeValueAnalysis({
  data,
  dataKey,
  unit,
  title,
  color,
}: ExtremeValueAnalysisProps) {
  const [groupBy, setGroupBy] = useState<"year" | "month">("year");
  const [analysisType, setAnalysisType] = useState<"max" | "min">("max");
  const [loadCalculation, setLoadCalculation] = useState(false);
  const [environmentalType, setEnvironmentalType] = useState<
    "wave" | "wind" | "current"
  >("wave");

  // 返回期 (年)
  const returnPeriods = [5, 10, 20, 25, 50, 100];

  // 根据分组和极值类型处理数据
  const processedData = useMemo(() => {
    const groupedData = groupDataByPeriod(data, groupBy, dataKey);

    // 提取每组的极值
    const extremeValues: { period: string; value: number }[] = [];

    Object.entries(groupedData).forEach(([period, values]) => {
      if (values.length > 0) {
        const extremeValue =
          analysisType === "max" ? Math.max(...values) : Math.min(...values);

        extremeValues.push({
          period,
          value: extremeValue,
        });
      }
    });

    // 按时间排序
    return extremeValues.sort((a, b) => a.period.localeCompare(b.period));
  }, [data, dataKey, groupBy, analysisType]);

  // 计算皮尔逊III型参数
  const pearsonParams = useMemo(() => {
    if (processedData.length < 3) return null;

    const values = processedData.map((item) => item.value);
    return calculatePearsonTypeIIIParams(values);
  }, [processedData]);

  // 计算多年一遇值
  const returnPeriodValues = useMemo(() => {
    if (!pearsonParams) return [];

    return returnPeriods.map((period) => {
      // 计算频率 (1/T)
      const frequency = 1 / period;

      // 计算对应的极值
      const extremeValue = calculatePearsonTypeIIIValue(
        pearsonParams,
        frequency
      );

      // 计算对应的环境荷载
      const environmentalLoad = loadCalculation
        ? calculateEnvironmentalLoad(extremeValue, environmentalType)
        : null;

      return {
        period,
        extremeValue,
        environmentalLoad,
      };
    });
  }, [pearsonParams, loadCalculation, environmentalType]);

  // 图表数据
  const chartData = useMemo(() => {
    return processedData.map((item) => ({
      period: item.period,
      observed: item.value,
    }));
  }, [processedData]);

  // 拟合曲线数据点
  const fittedCurveData = useMemo(() => {
    if (!pearsonParams || returnPeriodValues.length === 0) return [];

    // 创建更多点以平滑曲线
    const points = [];
    const n = processedData.length;

    // 使用经验频率公式生成点
    for (let m = 1; m <= n; m++) {
      const p = m / (n + 1); // 经验频率公式
      const value = calculatePearsonTypeIIIValue(pearsonParams, p);
      points.push({
        period: m,
        fitted: value,
      });
    }

    // 添加重现期对应的点
    returnPeriods.forEach((period) => {
      const p = 1 / period;
      const value = calculatePearsonTypeIIIValue(pearsonParams, p);
      points.push({
        period,
        fitted: value,
      });
    });

    // 按周期排序
    return points.sort((a, b) => a.period - b.period);
  }, [pearsonParams, returnPeriodValues, processedData.length, returnPeriods]);

  // 导出数据到Excel
  const exportToExcel = () => {
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet([
      // 表头
      [
        "时段",
        `观测${title}(${unit})`,
        "拟合值",
        ...(loadCalculation ? ["环境荷载 (N)"] : []),
      ],
      // 数据行
      ...processedData.map((item) => {
        const fittedPoint = fittedCurveData.find(
          (p) => p.period === parseInt(item.period)
        );
        return [
          item.period,
          item.value.toFixed(2),
          fittedPoint ? fittedPoint.fitted.toFixed(2) : "",
          loadCalculation && fittedPoint
            ? calculateEnvironmentalLoad(
                fittedPoint.fitted,
                environmentalType
              ).toFixed(2)
            : "",
        ].filter((x) => x !== "");
      }),
      // 空行
      [],
      // 统计参数
      ["统计参数:"],
      ["样本量", pearsonParams?.n || ""],
      ["均值", pearsonParams?.mean.toFixed(2) || ""],
      ["标准差", pearsonParams?.stdDev.toFixed(2) || ""],
      ["偏态系数", pearsonParams?.skewness.toFixed(2) || ""],
      // 空行
      [],
      // 重现期分析结果
      ["重现期分析:"],
      [
        "重现期(年)",
        `${title}(${unit})`,
        ...(loadCalculation ? ["环境荷载 (N)"] : []),
      ],
      ...returnPeriodValues.map((item) =>
        [
          item.period,
          item.extremeValue.toFixed(2),
          loadCalculation ? item.environmentalLoad?.toFixed(2) : "",
        ].filter((x) => x !== "")
      ),
    ]);

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "极值分析");

    // 导出文件
    XLSX.writeFile(wb, `${title}极值分析结果.xlsx`);
  };

  // 如果没有足够的数据
  if (processedData.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title} 极值分析</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            需要至少3个周期的数据才能进行极值分析。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">
              {title}极值分析
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={loadCalculation ? "default" : "outline"}
                size="sm"
                onClick={() => setLoadCalculation(!loadCalculation)}
              >
                <Calculator className="h-4 w-4 mr-1" />
                环境荷载
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-1" />
                导出结果
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <h3 className="font-medium mb-2">分组方式</h3>
                <div className="flex">
                  <Button
                    variant={groupBy === "year" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGroupBy("year")}
                    className="rounded-r-none"
                  >
                    按年
                  </Button>
                  <Button
                    variant={groupBy === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGroupBy("month")}
                    className="rounded-l-none"
                  >
                    按月
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">分析类型</h3>
                <div className="flex">
                  <Button
                    variant={analysisType === "max" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnalysisType("max")}
                    className="rounded-r-none"
                  >
                    最大值
                  </Button>
                  <Button
                    variant={analysisType === "min" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnalysisType("min")}
                    className="rounded-l-none"
                  >
                    最小值
                  </Button>
                </div>
              </div>

              {loadCalculation && (
                <div>
                  <h3 className="font-medium mb-2">荷载类型</h3>
                  <div className="flex">
                    <Button
                      variant={
                        environmentalType === "wave" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setEnvironmentalType("wave")}
                      className="rounded-r-none"
                    >
                      波浪
                    </Button>
                    <Button
                      variant={
                        environmentalType === "wind" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setEnvironmentalType("wind")}
                      className="rounded-none"
                    >
                      风力
                    </Button>
                    <Button
                      variant={
                        environmentalType === "current" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setEnvironmentalType("current")}
                      className="rounded-l-none"
                    >
                      水流
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    type="category"
                    allowDuplicatedCategory={false}
                  />
                  <YAxis
                    label={{
                      value: `${title} (${unit})`,
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    data={chartData}
                    dataKey="observed"
                    name="观测值"
                    stroke={color}
                    dot={{ fill: color }}
                  />
                  <Line
                    data={fittedCurveData}
                    dataKey="fitted"
                    name="拟合曲线"
                    stroke={color}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">统计参数</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">样本量</TableCell>
                        <TableCell>{pearsonParams?.n || "-"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">均值</TableCell>
                        <TableCell>
                          {pearsonParams?.mean.toFixed(2) || "-"} {unit}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">标准差</TableCell>
                        <TableCell>
                          {pearsonParams?.stdDev.toFixed(2) || "-"} {unit}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">偏态系数</TableCell>
                        <TableCell>
                          {pearsonParams?.skewness.toFixed(2) || "-"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">重现期分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>重现期 (年)</TableHead>
                        <TableHead>
                          {title} ({unit})
                        </TableHead>
                        {loadCalculation && <TableHead>环境荷载 (N)</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnPeriodValues.map((item) => (
                        <TableRow key={item.period}>
                          <TableCell>{item.period}</TableCell>
                          <TableCell>{item.extremeValue.toFixed(2)}</TableCell>
                          {loadCalculation && (
                            <TableCell>
                              {item.environmentalLoad?.toFixed(2)}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
