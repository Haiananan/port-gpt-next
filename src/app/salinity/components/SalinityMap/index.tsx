"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MapLegend from "./MapLegend";

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
  const map = useRef<maplibregl.Map | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [120.404, 36.915], // 中心点设在渤海
      zoom: 6,
    });

    map.current.addControl(new maplibregl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
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
            salinity: stats?.avgSalinity,
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

    fetchData();
  }, []);

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
      const size = 20 + (station.salinity || 30) / 2;
      
      el.className = "station-marker";
      el.style.backgroundColor = `rgba(59, 130, 246, ${
        ((station.salinity || 30) - 25) / 10
      })`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

      // 创建弹出框
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-medium">${station.stationName}</h3>
          <p class="text-sm text-gray-600">盐度: ${
            station.salinity?.toFixed(3) || "N/A"
          }‰</p>
          <p class="text-sm text-gray-600">平均温度: ${
            station.avgTemp?.toFixed(1) || "N/A"
          }°C</p>
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
    <Card className="relative">
      <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
      <MapLegend />
    </Card>
  );
} 