"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Map, TrendingUp, Table2 } from "lucide-react";
import SalinityMap from "./components/SalinityMap";
import TrendAnalysis from "./components/TrendAnalysis";
import StationCard from "./components/StationCard";
// import DataTable from "./components/DataTable";

export default function SalinityAnalysis() {
  return (
    <div className="container py-6 space-y-6 mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">盐度分析</h1>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">
            <Map className="w-4 h-4 mr-2" />
            空间分布
          </TabsTrigger>
          <TabsTrigger value="trend">
            <TrendingUp className="w-4 h-4 mr-2" />
            趋势分析
          </TabsTrigger>
          <TabsTrigger value="data">
            <Table2 className="w-4 h-4 mr-2" />
            数据查看
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <StationCard />
                <StationCard />
                <StationCard />
                <StationCard />
              </div>
              <SalinityMap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardContent className="pt-6">
              <TrendAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardContent className="pt-6">{/* <DataTable /> */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
