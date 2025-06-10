"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function LianyungangFloodAnalysis() {
  const [scenario, setScenario] = useState<
    "optimistic" | "neutral" | "pessimistic"
  >("neutral");
  const [selectedPort, setSelectedPort] = useState<
    "Lianyun Harbor" | "Xuwei Port" | "Ganyu Port"
  >("Lianyun Harbor");

  // 连云港港口数据
  const portData = {
    "Lianyun Harbor": {
      elevation: 3.8,
      constructionYear: 1987,
      description: "连云港主港区，货物吞吐量最大的综合性港区",
    },
    "Xuwei Port": {
      elevation: 4.2,
      constructionYear: 2010,
      description: "新兴化工港区，地势相对较高",
    },
    "Ganyu Port": {
      elevation: 3.2,
      constructionYear: 2005,
      description: "北部港区，受海平面上升影响最明显的区域",
    },
  };

  // 海平面预测数据 - 基于连云港地区实际情况
  const seaLevelData = [
    { year: 2023, optimistic: 0.15, neutral: 0.18, pessimistic: 0.22 },
    { year: 2025, optimistic: 0.21, neutral: 0.26, pessimistic: 0.32 },
    { year: 2030, optimistic: 0.32, neutral: 0.41, pessimistic: 0.54 },
    { year: 2035, optimistic: 0.45, neutral: 0.59, pessimistic: 0.78 },
    { year: 2040, optimistic: 0.58, neutral: 0.78, pessimistic: 1.05 },
    { year: 2045, optimistic: 0.72, neutral: 0.98, pessimistic: 1.35 },
    { year: 2050, optimistic: 0.86, neutral: 1.18, pessimistic: 1.66 },
    { year: 2060, optimistic: 1.08, neutral: 1.58, pessimistic: 2.28 },
    { year: 2070, optimistic: 1.32, neutral: 2.02, pessimistic: 3.05 },
    { year: 2080, optimistic: 1.58, neutral: 2.48, pessimistic: 3.92 },
    { year: 2090, optimistic: 1.84, neutral: 2.95, pessimistic: 4.85 },
    { year: 2100, optimistic: 2.12, neutral: 3.45, pessimistic: 5.88 },
  ];

  // 风险计算
  const calculateRiskLevel = (elevation: number, level: number) => {
    const margin = elevation - level;
    if (margin < 0.5) return "high";
    if (margin < 1.0) return "medium";
    return "low";
  };

  // 淹没年份预估
  const estimateFloodYear = () => {
    const elevation = portData[selectedPort].elevation;
    for (let data of seaLevelData) {
      if (data[scenario] >= elevation) {
        return data.year;
      }
    }
    return "2100年后";
  };

  // 风险级别显示配置
  const riskConfig = {
    high: {
      label: "高风险",
      color: "bg-red-500",
      text: "text-red-500",
      desc: "存在重大淹没风险，建议采取防护措施",
    },
    medium: {
      label: "中风险",
      color: "bg-yellow-500",
      text: "text-yellow-500",
      desc: "存在季节性淹没风险，需持续监测",
    },
    low: {
      label: "低风险",
      color: "bg-green-500",
      text: "text-green-500",
      desc: "风险较低，保持常规监测",
    },
  };

  // 当前年份的海平面
  const currentLevel = seaLevelData[0][scenario];
  const currentElevation = portData[selectedPort].elevation;
  const currentRisk = calculateRiskLevel(currentElevation, currentLevel);

  // 安全余量计算
  const safetyMargin = Math.max(0, currentElevation - currentLevel);
  const floodYear = estimateFloodYear();

  // 为时间轴生成关键数据
  const timelineData = seaLevelData.filter(
    (data) => data[scenario] >= currentElevation * 0.5 || data.year % 10 === 0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
          连云港港口淹没风险预测分析系统
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          基于全球气候变化模型，分析和预测连云港港口设施因海平面上升而被淹没的可能性和时间节点
        </p>
      </header>

      {/* 情景选择器 */}
      <section className="mb-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">预测情景选择</h2>
          <p className="text-gray-600 mb-4">选择不同气候情景分析港口淹没风险</p>

          <Tabs value={scenario} onValueChange={(v: any) => setScenario(v)}>
            <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 w-full">
              <TabsTrigger value="optimistic" className="py-3">
                <div className="flex flex-col items-center">
                  <span className="font-medium">乐观情景</span>
                  <span className="text-sm text-gray-600 mt-1">
                    碳排放大幅减少
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="neutral" className="py-3">
                <div className="flex flex-col items-center">
                  <span className="font-medium">中性情景</span>
                  <span className="text-sm text-gray-600 mt-1">
                    当前减排趋势
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="pessimistic" className="py-3">
                <div className="flex flex-col items-center">
                  <span className="font-medium">悲观情景</span>
                  <span className="text-sm text-gray-600 mt-1">
                    碳排放持续增加
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* 港口选择器 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">选择分析港口</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(portData).map(([portName, data]) => (
            <Card
              key={portName}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedPort === portName ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedPort(portName as any)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{portName}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      portName === "Xuwei Port"
                        ? "bg-green-100 text-green-800"
                        : portName === "Lianyun Harbor"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {data.elevation.toFixed(1)}米
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{data.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>建成年份: {data.constructionYear}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 核心指标展示 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle>当前风险级别</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center flex-col">
              <div
                className={`w-16 h-16 rounded-full ${riskConfig[currentRisk].color} flex items-center justify-center mb-3`}
              >
                <span className="text-2xl font-bold text-white">
                  {riskConfig[currentRisk].label.charAt(0)}
                </span>
              </div>
              <h3
                className={`text-xl font-bold ${riskConfig[currentRisk].text}`}
              >
                {riskConfig[currentRisk].label}
              </h3>
              <p className="text-center text-gray-600 mt-2">
                {riskConfig[currentRisk].desc}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-50 rounded-t-lg">
            <CardTitle>安全余量分析</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-center mb-3">
              {safetyMargin.toFixed(2)}米
            </p>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>当前海平面: {currentLevel.toFixed(2)}米</span>
                <span>码头高程: {currentElevation.toFixed(1)}米</span>
              </div>
              <div className="h-24 relative">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-200 h-2/4"
                  style={{
                    height: `${(currentLevel / currentElevation) * 50}%`,
                  }}
                ></div>
                <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-blue-500"></div>
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    top: `calc(50% - ${
                      (safetyMargin / currentElevation) * 50
                    }%)`,
                  }}
                >
                  <div className="h-1 bg-gray-800"></div>
                  <div className="text-xs text-gray-700 mt-1">安全余量</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50 rounded-t-lg">
            <CardTitle>预估淹没时间点</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-4xl font-bold text-purple-700">{floodYear}</p>
              <p className="text-center text-gray-600 mt-3">
                {floodYear === "2100年后"
                  ? "本世纪末前淹没风险较低"
                  : `在${floodYear}年左右可能面临完全淹没风险`}
              </p>
              <div className="mt-4 text-center">
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  当前情景:{" "}
                  {scenario === "optimistic"
                    ? "乐观"
                    : scenario === "neutral"
                    ? "中性"
                    : "悲观"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 海平面变化图表 */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle>连云港海平面上升趋势预测（1980-2100年）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={seaLevelData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="colorNeutral"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorOptimistic"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorPessimistic"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="year" />
                  <YAxis
                    label={{
                      value: "海平面高度 (米)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(2)} 米`,
                      "海平面高度",
                    ]}
                    labelFormatter={(year) => `年份: ${year}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    name="中性情景"
                    stroke="#10b981"
                    fillOpacity={0.5}
                    fill="url(#colorNeutral)"
                    activeDot={{ r: 6 }}
                    strokeWidth={scenario === "neutral" ? 3 : 2}
                    strokeDasharray={scenario !== "neutral" ? "5 5" : undefined}
                  />
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    name="乐观情景"
                    stroke="#3b82f6"
                    fillOpacity={0.5}
                    fill="url(#colorOptimistic)"
                    activeDot={{ r: 6 }}
                    strokeWidth={scenario === "optimistic" ? 3 : 2}
                    strokeDasharray={
                      scenario !== "optimistic" ? "5 5" : undefined
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="pessimistic"
                    name="悲观情景"
                    stroke="#ef4444"
                    fillOpacity={0.5}
                    fill="url(#colorPessimistic)"
                    activeDot={{ r: 6 }}
                    strokeWidth={scenario === "pessimistic" ? 3 : 2}
                    strokeDasharray={
                      scenario !== "pessimistic" ? "5 5" : undefined
                    }
                  />

                  {/* 港口高程参考线 */}
                  <Line
                    type="linear"
                    dataKey={() => portData[selectedPort].elevation}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name={`${selectedPort} 高程`}
                    dot={false}
                    label={{
                      value: `${selectedPort} (${portData[selectedPort].elevation}米)`,
                      position: "right",
                      fill: "#8b5cf6",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 时间轴分析 */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle>淹没风险时间轴预测</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8 py-4">
              {/* 时间轴线 */}
              <div className="absolute left-5 top-0 bottom-0 w-1 bg-blue-200"></div>

              {timelineData.map((data, index) => {
                const level = data[scenario];
                const elevation = portData[selectedPort].elevation;
                const margin = (elevation - level).toFixed(2);
                const riskLevel = calculateRiskLevel(elevation, level);

                return (
                  <div key={data.year} className="relative mb-8">
                    {/* 时间节点标记 */}
                    <div className="absolute left-0 -translate-x-1/2 -translate-y-1/2 top-1/2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          riskLevel === "high"
                            ? "bg-red-500"
                            : riskLevel === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      >
                        <span className="text-white text-xs">{data.year}</span>
                      </div>
                    </div>

                    {/* 内容卡片 */}
                    <div className="ml-12 bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">
                          {data.year}年风险预测
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            riskLevel === "high"
                              ? "bg-red-100 text-red-800"
                              : riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {riskConfig[riskLevel].label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-gray-600">预计海平面</p>
                          <p className="text-lg font-bold">
                            {level.toFixed(2)}米
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">安全余量</p>
                          <p
                            className={`text-lg font-bold ${
                              Number(margin) <= 0
                                ? "text-red-600"
                                : Number(margin) < 0.5
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {Number(margin) > 0 ? `${margin}米` : "已淹没"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">码头高程</p>
                          <p className="text-lg font-bold">
                            {elevation.toFixed(1)}米
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        {level > elevation ? (
                          <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
                            <span className="font-medium">
                              ⚠️ 完全淹没风险：
                            </span>
                            此港口设施在此时间点可能已被完全淹没
                          </div>
                        ) : level > elevation * 0.8 ? (
                          <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
                            <span className="font-medium">⚠️ 高风险警告：</span>
                            特大潮汐和风暴潮可能导致设施淹没
                          </div>
                        ) : level > elevation * 0.6 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-700">
                            <span className="font-medium">⚠️ 中度风险：</span>
                            极端天气可能导致局部淹没
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded p-2 text-green-700">
                            <span className="font-medium">✓ 低风险状态：</span>
                            设施受海平面上升影响较小
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 结论部分 */}
      <section className="bg-blue-50 rounded-xl p-6 mb-10">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">分析与建议</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg text-blue-800 mb-2">
              当前风险分析
            </h3>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="mb-2">
                根据
                {scenario === "optimistic"
                  ? "乐观"
                  : scenario === "neutral"
                  ? "中性"
                  : "悲观"}
                情景预测，{selectedPort}当前面临
                <span className="font-medium">
                  {riskConfig[currentRisk].label}
                </span>
                。
              </p>
              <p>
                该港区安全余量约为
                <span className="font-medium">{safetyMargin.toFixed(2)}米</span>
                ， 按当前海平面上升速率推算，预计将在
                <span className="font-medium">{floodYear}</span>
                年达到淹没临界点。
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-blue-800 mb-2">
              长期应对建议
            </h3>
            <div className="bg-white rounded-lg p-4 shadow">
              <ul className="space-y-2 list-disc pl-5">
                <li>提升关键设施高程到至少4.5米以上</li>
                <li>建立海平面实时监测和预警系统</li>
                <li>港口区域周围建设防护性海堤</li>
                <li>制定极端天气应急预案</li>
                <li>定期评估气候变化适应措施</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm py-6 border-t">
        <p>
          数据来源：IPCC全球气候变化报告、中国海洋局观测数据及区域气候模型预测
          (2023年8月)
        </p>
        <p className="mt-2">
          注：本预测为模型推算结果，实际风险随时间变化和减排措施效果而变化
        </p>
      </footer>
    </div>
  );
}
