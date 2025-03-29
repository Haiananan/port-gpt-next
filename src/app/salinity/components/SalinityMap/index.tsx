"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MapLegend from "./MapLegend";

// 动态导入 maplibre-gl 以避免 SSR
const maplibregl = dynamic(() => import("maplibre-gl"), {
  ssr: false,
});

interface Station {
  stationCode: string;
  stationName: string;
  latitude: number;
  longitude: number;
  salinity?: number;
  avgTemp?: number;
}

export default function SalinityMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || typeof window === "undefined") return;

    // 动态导入 CSS
    import("maplibre-gl/dist/maplibre-gl.css");

    const initializeMap = async () => {
      const maplibregl = (await import("maplibre-gl")).default;

      map.current = new maplibregl.Map({
        container: mapContainer.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [121.5, 36.5], // 渤海中心位置
        zoom: 7,
        maxBounds: [
          [115, 32], // 西南角
          [127, 41], // 东北角
        ],
      });

      map.current.addControl(new maplibregl.NavigationControl());

      map.current.on("load", () => {
        fetchData();
      });
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  async function fetchData() {
    try {
      const [stationsRes, statsRes] = await Promise.all([
        fetch("/api/salinity/stations"),
        fetch("/api/salinity/stats"),
      ]);

      const stationsData = await stationsRes.json();
      const statsData = await statsRes.json();

      // 合并站点信息和统计数据
      const mergedData = stationsData.map((station: Station) => {
        const stats = statsData.find(
          (s: any) => s.stationCode === station.stationCode
        );
        return {
          ...station,
          salinity: stats?.salinity,
          avgTemp: stats?.avgTemp,
        };
      });

      setStations(mergedData);
      addMarkersToMap(mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  function addMarkersToMap(stations: Station[]) {
    if (!map.current) return;

    // 清除现有标记
    const markers = document.getElementsByClassName("maplibregl-marker");
    while (markers[0]) {
      markers[0].remove();
    }

    stations.forEach((station) => {
      // 创建标记元素
      const el = document.createElement("div");
      const salinity = station.salinity ?? 30;
      const size = Math.max(20, Math.min(40, 20 + (salinity - 28) * 4));

      el.className = "station-marker";
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background-color: rgba(59, 130, 246, ${Math.min(
          1,
          (salinity - 28) / 4
        )});
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      `;

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.1)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      // 创建弹出框
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-medium text-lg mb-2">${station.stationName}</h3>
          <div class="space-y-1">
            <p class="text-sm">
              <span class="text-muted-foreground">盐度:</span> 
              <span class="font-medium">${station.salinity?.toFixed(3)}‰</span>
            </p>
            <p class="text-sm">
              <span class="text-muted-foreground">平均温度:</span> 
              <span class="font-medium">${station.avgTemp?.toFixed(1)}°C</span>
            </p>
            <p class="text-sm">
              <span class="text-muted-foreground">位置:</span> 
              <span class="font-medium">${station.latitude.toFixed(
                3
              )}°N, ${station.longitude.toFixed(3)}°E</span>
            </p>
          </div>
        </div>
      `);

      // 添加标记到地图
      new maplibregl.Marker(el)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }

  if (loading) {
    return <Skeleton className="w-full h-[600px] rounded-lg" />;
  }

  return (
    <Card className="relative" suppressHydrationWarning>
      <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
      <MapLegend />
    </Card>
  );
}
