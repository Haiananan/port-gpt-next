"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, TrendingUp, BarChart3, Target } from "lucide-react";
import TrendChart from "./components/TrendChart";
import RegionalComparison from "./components/RegionalComparison";
import YearlyHighlights from "./components/YearlyHighlights";
import PredictionSection from "./components/PredictionSection";
import RegionMap from "./components/RegionMap";
import {
  getLatestDataset,
  getAnnualMeanLevels,
  getInterannualChanges,
} from "./utils/dataProcessor";

const STAT_CARDS = [
  {
    id: "latest",
    title: "最新海平面",
    icon: Waves,
    color: "#3b82f6",
    getValue: (data: any) => data.annualData[0].annual.meanLevel,
    unit: "毫米",
    description: "较常年平均水平的偏差",
  },
  {
    id: "change",
    title: "年际变化",
    icon: TrendingUp,
    color: "#10b981",
    getValue: (_: any, change: number) => Math.abs(change),
    unit: "毫米",
    getDescription: (change: number) => `较上年${change > 0 ? "上升" : "下降"}`,
  },
  {
    id: "rate",
    title: "上升速率",
    icon: BarChart3,
    color: "#f59e0b",
    getValue: (data: any) => data.longTermTrends.periods[0].riseRate,
    unit: "毫米/年",
    description: "长期平均上升速率",
  },
  {
    id: "prediction",
    title: "30年预测",
    icon: Target,
    color: "#ef4444",
    getValue: (data: any) => data.predictions.riseRange.max,
    unit: "毫米",
    getDescription: (_: any, __: any, data: any) =>
      `预测上限 (${data.predictions.period}年)`,
  },
];

export default function SeaLevelAnalysis() {
  const latestData = getLatestDataset();
  const annualData = getAnnualMeanLevels();
  const interannualChanges = getInterannualChanges();
  const recentChange =
    interannualChanges[interannualChanges.length - 1]?.change || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">中国海平面变化分析</h1>
        <p className="text-muted-foreground mt-2">
          基于{latestData.metadata.dataSource}的综合分析
          <span className="ml-2 text-sm">
            ({Math.min(...annualData.map((d) => d.year))} -{" "}
            {Math.max(...annualData.map((d) => d.year))})
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {STAT_CARDS.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="p-4 border-b"
                style={{
                  backgroundColor: `${card.color}08`,
                  borderColor: `${card.color}20`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <card.icon
                      size={24}
                      style={{ color: card.color }}
                      strokeWidth={1.5}
                    />
                    <span>{card.title}</span>
                  </h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: card.color }}
                  >
                    {card.getValue(latestData, recentChange).toFixed(1)}
                  </span>
                  <span className="text-base text-muted-foreground">
                    {card.unit}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {card.getDescription
                    ? card.getDescription(recentChange, null, latestData)
                    : card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
          <TabsTrigger value="map">区域分布</TabsTrigger>
          <TabsTrigger value="trend">趋势分析</TabsTrigger>
          <TabsTrigger value="compare">区域对比</TabsTrigger>
          <TabsTrigger value="events">极值事件</TabsTrigger>
          <TabsTrigger value="predict">预测评估</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <RegionMap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardContent className="pt-6">
              <TrendChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardContent className="pt-6">
              <RegionalComparison />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardContent className="pt-6">
              <YearlyHighlights />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predict">
          <Card>
            <CardContent className="pt-6">
              <PredictionSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
