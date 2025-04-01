"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getRegionalTrends, getLatestDataset } from "../../utils/dataProcessor";
import { Card } from "@/components/ui/card";
import { Waves, ArrowUpRight, ArrowDownRight } from "lucide-react";

const REGION_METADATA = {
  bohai: {
    name: "渤海",
    center: [120.849, 38.236] as [number, number],
    description: "受气候变化影响显著",
    color: "#8884d8",
  },
  yellowSea: {
    name: "黄海",
    center: [123.784, 35.126] as [number, number],
    description: "海平面变化相对稳定",
    color: "#82ca9d",
  },
  eastSea: {
    name: "东海",
    center: [123.784, 30.126] as [number, number],
    description: "受台风影响较大",
    color: "#ffc658",
  },
  southSea: {
    name: "南海",
    center: [113.784, 21.126] as [number, number],
    description: "年际变化显著",
    color: "#ff7300",
  },
};

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const regionalData = getRegionalTrends();
  const latestData = getLatestDataset();

  // 计算各区域的统计数据
  const regionStats = Object.entries(regionalData).map(([region, data]) => {
    const values = data.map(d => d.value);
    const currentValue = data[data.length - 1].value;
    const prevValue = data[data.length - 2].value;
    const trend = currentValue - prevValue;

    return {
      region,
      current: currentValue,
      trend,
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [116.404, 31.915],
      zoom: 4,
      maxBounds: [
        [90, 15],
        [135, 45],
      ],
    });

    // 添加标记和弹出框
    Object.entries(REGION_METADATA).forEach(([key, region]) => {
      const stats = regionStats.find(s => s.region === key)!;
      
      const el = document.createElement("div");
      el.className = "custom-marker";
      const size = Math.abs(stats.current) / 20 + 20;
      
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background-color: ${stats.current > 0 ? "#ef4444" : "#3b82f6"};
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid white;
        transition: all 0.3s ease;
        opacity: 0.8;
      `;

      el.addEventListener("click", () => {
        setSelectedRegion(key);
      });

      if (map.current) {
        new maplibregl.Marker(el)
          .setLngLat(region.center)
          .addTo(map.current);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
        <div className="absolute bottom-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <h4 className="font-medium mb-2">海平面变化</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">高于常年水平</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm">低于常年水平</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              * 圆点大小表示偏差程度
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {regionStats.map((stats) => {
          const metadata = REGION_METADATA[stats.region as keyof typeof REGION_METADATA];
          const isSelected = selectedRegion === stats.region;
          
          return (
            <Card
              key={stats.region}
              className={`p-4 cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRegion(stats.region)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Waves size={16} className="text-muted-foreground" />
                    {metadata.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metadata.description}
                  </p>
                </div>
                {stats.trend > 0 ? (
                  <ArrowUpRight className="text-red-500" />
                ) : (
                  <ArrowDownRight className="text-blue-500" />
                )}
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">当前偏差</span>
                  <span className="font-medium">{stats.current.toFixed(1)}毫米</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">年际变化</span>
                  <span className="font-medium">
                    {stats.trend > 0 ? "+" : ""}
                    {stats.trend.toFixed(1)}毫米
                  </span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full mt-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${((stats.current - stats.min) / (stats.max - stats.min)) * 100}%`,
                      backgroundColor: metadata.color,
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
