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

// 修改波浪荷载计算函数
const calculateWaveLoad = (H: number) => {
  // 基本参数
  const rho = 1025; // 海水密度 kg/m³
  const g = 9.81; // 重力加速度 m/s²
  const D = 3; // 圆柱体直径 m
  const d = 30; // 水深 m
  const l = 90; // 圆柱体海平面上高度 m
  const T = 7.94; // 波浪周期 s
  const Cd = 1.2; // 拖曳系数
  const Cm = 2; // 惯性系数
  const omega = (2 * Math.PI) / T; // 波浪频率 rad/s

  // 计算波数 k (使用简化的深水波近似)
  const k = omega ** 2 / g;

  // 计算波长和波速
  const waveLength = (2 * Math.PI) / k;
  const waveSpeed = waveLength / T;

  // 计算最大波浪爬升高度
  const H_d = H / d; // H/d 比
  const intercept = 0.49758;
  const B1 = 0.63675;
  const B2 = -0.33942;
  const eta_max_H = intercept + B1 * H_d + B2 * H_d ** 2;
  const eta_max = eta_max_H * H;

  // 计算作用范围
  const z1 = 0;
  const z2_PD_max = d + eta_max;
  const z2_PI_max = d + eta_max - H / 2;

  // 计算系数 K1, K2
  const K1 =
    ((4 * Math.PI * z2_PD_max) / waveLength -
      (4 * Math.PI * z1) / waveLength +
      Math.sinh((4 * Math.PI * z2_PD_max) / waveLength) -
      Math.sinh((4 * Math.PI * z1) / waveLength)) /
    (8 * Math.sinh((4 * Math.PI * d) / waveLength));

  const K2 =
    (Math.sinh((2 * Math.PI * z2_PI_max) / waveLength) -
      Math.sinh((2 * Math.PI * z1) / waveLength)) /
    Math.cosh((2 * Math.PI * d) / waveLength);

  // 计算最大拖曳力和惯性力
  const P_D_max = 0.5 * Cd * rho * g * D * H ** 2 * K1;
  const P_I_max = 0.125 * Cm * rho * g * Math.PI * D ** 2 * H * K2;

  // 计算最大总波浪力
  let P_m;
  if (P_D_max <= 0.5 * P_I_max) {
    P_m = P_I_max; // 取最大惯性力
  } else {
    P_m = P_D_max * (1 + 0.25 * (P_I_max / P_D_max) ** 2);
  }

  return P_m; // 返回最大总波浪力（单位：N）
};

// 添加风力荷载计算函数
const calculateWindLoad = (V_ref: number) => {
  // 基本参数
  const rho_air = 1.225; // 空气密度，kg/m³
  const Cd = 0.5; // 阻力系数
  const D = 3; // 塔筒直径，m
  const H_total = 120; // 塔筒总高度，m
  const H_water = 30; // 水深，m
  const H = H_total - H_water; // 轮毂高度，m
  const z_ref = 10; // 参考高度，m
  const alpha = 0.12; // 风速剖面指数
  const R = 60; // 转子半径，m
  const L_blade = 62.9; // 叶片长度，m
  const W_blade = 5; // 最大弦长，m
  const num_blades = 3; // 叶片数量

  // 风机运行参数
  const v_cut_in = 3; // 切入风速，m/s
  const v_rated = 11.4; // 额定风速，m/s
  const v_cut_out = 25; // 切出风速，m/s

  // 计算轮毂高度处的风速
  const V_hub = V_ref * Math.pow(H / z_ref, alpha);

  // 计算叶片扫掠面积
  const A_R = Math.PI * R ** 2;

  // 计算风机推力
  let F_wind_rotor = 0;
  if (V_hub >= v_cut_in && V_hub <= v_cut_out) {
    // 计算推力系数
    let C_T;
    if (V_hub <= v_rated) {
      C_T = (3.5 * (2 * v_rated - 3.5)) / v_rated ** 2;
    } else {
      C_T = (3.5 * v_rated * (2 * v_rated + 3.5)) / V_hub ** 3;
    }
    F_wind_rotor = 0.5 * rho_air * C_T * A_R * V_hub ** 2;
  } else {
    // 停机状态下的风荷载
    const A_B = 0.5 * L_blade * W_blade * num_blades;
    const C_T = V_hub < v_cut_in ? 1.0 : 1.5;
    F_wind_rotor = 0.5 * rho_air * A_B * C_T * V_hub ** 2;
  }

  // 计算塔架风荷载
  const n = 100; // 分段数
  const dz = H / n;
  let F_w_segment = 0;

  for (let i = 0; i < n; i++) {
    const z = (i + 0.5) * dz;
    const v_z = V_ref * Math.pow(z / z_ref, alpha);
    F_w_segment += 0.5 * rho_air * Cd * D * dz * v_z ** 2;
  }

  // 计算总风荷载
  const F_wind_total = F_wind_rotor + F_w_segment;

  return F_wind_total; // 返回总风荷载（单位：N）
};

// 修改环境荷载计算函数
const calculateEnvironmentalLoad = (
  extremeValue: number,
  type: "wave" | "wind" | "current"
) => {
  switch (type) {
    case "wave":
      return calculateWaveLoad(extremeValue);

    case "wind":
      return calculateWindLoad(extremeValue);

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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">样本量</p>
                      <p className="text-2xl font-bold">
                        {pearsonParams?.n || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">均值</p>
                      <p className="text-2xl font-bold">
                        {pearsonParams?.mean.toFixed(2) || "-"}
                        <span className="text-xs text-muted-foreground ml-1">
                          {unit}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">标准差</p>
                      <p className="text-2xl font-bold">
                        {pearsonParams?.stdDev.toFixed(2) || "-"}
                        <span className="text-xs text-muted-foreground ml-1">
                          {unit}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">偏态系数</p>
                      <p className="text-2xl font-bold">
                        {pearsonParams?.skewness.toFixed(2) || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">重现期分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {returnPeriodValues.map((item, index) => (
                      <div
                        key={item.period}
                        className="flex justify-between items-center pb-2 border-b last:border-0"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {item.period} 年
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {title}
                            </p>
                            <p className="text-base font-semibold">
                              {item.extremeValue.toFixed(2)} {unit}
                            </p>
                          </div>
                          {loadCalculation && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                环境荷载
                              </p>
                              <p className="text-base font-semibold">
                                {item.environmentalLoad?.toFixed(2)} N
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
