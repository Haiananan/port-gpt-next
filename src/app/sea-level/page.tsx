"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import TrendChart from "./components/TrendChart";
import RegionalComparison from "./components/RegionalComparison";
import YearlyHighlights from "./components/YearlyHighlights";
import PredictionSection from "./components/PredictionSection";
import RegionMap from "./components/RegionMap";
import { seaLevel2022 } from "@/data/sea-level";

export default function SeaLevelAnalysis() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">中国海平面变化分析</h1>
        <p className="text-muted-foreground mt-2">
          基于{seaLevel2022.metadata.dataSource}的综合分析
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">年均海平面</h3>
            <div className="text-3xl font-bold text-primary">
              {seaLevel2022.annualData[0].annual.meanLevel}
              <span className="text-base font-normal text-muted-foreground ml-1">
                毫米
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              较常年平均水平的偏差
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">上升速率</h3>
            <div className="text-3xl font-bold text-primary">
              {seaLevel2022.longTermTrends.periods[0].riseRate}
              <span className="text-base font-normal text-muted-foreground ml-1">
                毫米/年
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              1980-2022年平均上升速率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">30年预测上限</h3>
            <div className="text-3xl font-bold text-primary">
              {seaLevel2022.predictions.riseRange.max}
              <span className="text-base font-normal text-muted-foreground ml-1">
                毫米
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              未来30年最大上升预测
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="map">区域分布</TabsTrigger>
          <TabsTrigger value="trend">趋势分析</TabsTrigger>
          <TabsTrigger value="compare">区域对比</TabsTrigger>
          <TabsTrigger value="predict">预测评估</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <RegionMap />
            </CardContent>
          </Card>
          <YearlyHighlights />
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
