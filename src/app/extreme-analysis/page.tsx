"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMockExtremeValues } from "@/services/coastalApi";
import { ExtremeValueAnalysis } from "@/components/ExtremeValueAnalysis";
import { Header } from "@/components/ui/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Waves, Wind, Thermometer, Gauge } from "lucide-react";

// 转换模拟的年度数据为ExtremeValueAnalysis可用的格式
const convertMockDataToAnalysisFormat = (mockData: any) => {
  if (!mockData || !mockData.data) return [];

  return mockData.data.map((item: any) => ({
    date: `${item.year}-01-01`, // 转换为日期格式
    [mockData.parameter]: item.value, // 动态设置参数字段名
  }));
};

// 参数配置
const parameterConfig = [
  {
    id: "waveHeight",
    title: "浪高",
    icon: Waves,
    unit: "m",
    color: "hsl(35.3 91.2% 51.6%)",
    description: "极值波高分析可用于确定海洋工程设计波高",
  },
  {
    id: "wavePeriod",
    title: "浪周期",
    icon: Waves,
    unit: "s",
    color: "hsl(262.1 83.3% 57.8%)",
    description: "周期极值分析对确定波浪能量与结构动力响应至关重要",
  },
  {
    id: "windSpeed",
    title: "风速",
    icon: Wind,
    unit: "m/s",
    color: "hsl(142.1 76.2% 36.3%)",
    description: "风速极值分析对风载荷计算与航线规划具有重要意义",
  },
  {
    id: "temperature",
    title: "气温",
    icon: Thermometer,
    unit: "°C",
    color: "hsl(0 84.2% 60.2%)",
    description: "气温极值分析对材料选择与热应力计算具有指导价值",
  },
  {
    id: "pressure",
    title: "气压",
    icon: Gauge,
    unit: "hPa",
    color: "hsl(201 96% 32%)",
    description: "气压极值分析可用于预测极端天气事件与台风路径",
  },
];

export default function MockExtremeAnalysisPage() {
  const [selectedParameter, setSelectedParameter] = useState("waveHeight");
  const [analysisType, setAnalysisType] = useState<"max" | "min">("max");
  const [years, setYears] = useState(30);
  const [isClient, setIsClient] = useState(false);

  // 确保SSR和客户端渲染一致
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取模拟数据
  const {
    data: mockData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["mockExtremeValues", selectedParameter, analysisType, years],
    queryFn: () =>
      fetchMockExtremeValues(selectedParameter, analysisType, years),
    enabled: isClient,
  });

  // 获取当前选择的参数配置
  const currentConfig = parameterConfig.find((p) => p.id === selectedParameter);

  // 转换数据格式
  const analysisData = mockData
    ? convertMockDataToAnalysisFormat(mockData)
    : [];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">极值分析模拟</h1>
        <p className="text-muted-foreground">
          本页面使用模拟生成的数据展示极值分析功能，可测试不同参数和重现期下的皮尔逊III型分布拟合效果
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {parameterConfig.map((param) => (
            <Button
              key={param.id}
              variant={selectedParameter === param.id ? "default" : "outline"}
              className="flex items-center gap-2 h-auto py-3"
              onClick={() => setSelectedParameter(param.id)}
            >
              {param.icon && <param.icon className="h-4 w-4" />}
              <span>{param.title}</span>
            </Button>
          ))}
        </div>

        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div>
              <h3 className="font-medium">分析类型</h3>
              <div className="flex mt-2">
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

            <div>
              <h3 className="font-medium">模拟年数</h3>
              <div className="flex mt-2">
                {[15, 30, 50, 80, 100].map((num) => (
                  <Button
                    key={num}
                    variant={years === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => setYears(num)}
                    className={`${
                      num === 15
                        ? "rounded-r-none rounded-l-md"
                        : num === 100
                        ? "rounded-l-none rounded-r-md"
                        : "rounded-none"
                    }`}
                  >
                    {num}年
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {currentConfig && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <currentConfig.icon className="h-4 w-4" />
              <span>{currentConfig.description}</span>
            </div>
          )}
        </div>

        {isClient ? (
          isLoading ? (
            <Card className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </Card>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                获取模拟数据失败: {(error as Error)?.message}
              </AlertDescription>
            </Alert>
          ) : analysisData.length > 0 && currentConfig ? (
            <ExtremeValueAnalysis
              data={analysisData}
              dataKey={selectedParameter}
              unit={currentConfig.unit}
              title={currentConfig.title}
              color={currentConfig.color}
            />
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                没有可用的数据进行分析
              </div>
            </Card>
          )
        ) : (
          <Card className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </Card>
        )}
      </div>
    </main>
  );
}
