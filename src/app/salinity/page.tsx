"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, TrendingUp } from "lucide-react";
import SalinityMap from "./components/SalinityMap";
import TrendAnalysis from "./components/TrendAnalysis";

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
        </TabsList>

        <TabsContent value="map">
          <SalinityMap />
        </TabsContent>

        <TabsContent value="trend">
          <TrendAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
