"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { seaLevel2022 } from "@/data/sea-level";

const COASTAL_REGIONS = [
  {
    name: "渤海",
    center: [120.849, 38.236] as [number, number],
    value: seaLevel2022.annualData[0].regional.bohai.comparedToNormal,
    description: "受气候变化影响显著",
  },
  {
    name: "黄海",
    center: [123.784, 35.126] as [number, number],
    value: seaLevel2022.annualData[0].regional.yellowSea.comparedToNormal,
    description: "海平面变化相对稳定",
  },
  {
    name: "东海",
    center: [123.784, 30.126] as [number, number],
    value: seaLevel2022.annualData[0].regional.eastSea.comparedToNormal,
    description: "受台风影响较大",
  },
  {
    name: "南海",
    center: [113.784, 21.126] as [number, number],
    value: seaLevel2022.annualData[0].regional.southSea.comparedToNormal,
    description: "年际变化显著",
  },
];

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [116.404, 31.915],
      zoom: 4,
      maxBounds: [
        [90, 15], // 西南角
        [135, 45], // 东北角
      ],
    });

    // 添加标记和弹出框
    COASTAL_REGIONS.forEach((region) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-lg">${region.name}</h3>
          <p class="text-sm text-gray-600">较常年偏差: ${region.value}毫米</p>
          <p class="text-xs text-gray-500 mt-1">${region.description}</p>
        </div>
      `);

      const el = document.createElement("div");
      el.className = "custom-marker";
      const size = Math.abs(region.value) / 20 + 20; // 根据值的大小调整标记尺寸
      el.style.backgroundColor = region.value > 0 ? "#ef4444" : "#3b82f6";
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      el.style.border = "2px solid white";
      el.style.transition = "all 0.3s ease";

      if (map.current) {
        new maplibregl.Marker(el)
          .setLngLat(region.center)
          .setPopup(popup)
          .addTo(map.current);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
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
  );
} 