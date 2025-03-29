"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

interface SalinityPoint {
  stationCode: string;
  stationName: string;
  longitude: number;
  latitude: number;
  salinity: number;
  avgTemp: number;
}

export default function SalinityMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // 初始化地图
    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
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
        center: [120.5, 35.5],
        zoom: 6,
        minZoom: 5,
        maxZoom: 12,
        maxBounds: [
          [117, 30],
          [124, 41],
        ],
      });

      // 添加控件
      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );
      map.current.addControl(
        new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
        "bottom-left"
      );
      setLoading(false);

      // 等待地图加载完成后再加载数据
      map.current.once("load", async () => {
        try {
          // 获取数据
          const [stationsRes, statsRes] = await Promise.all([
            fetch("/api/salinity/stations"),
            fetch("/api/salinity/stats"),
          ]);

          if (!stationsRes.ok || !statsRes.ok) {
            throw new Error("Failed to fetch data");
          }

          const stations = await stationsRes.json();
          const stats = await statsRes.json();

          // 合并站点和统计数据
          const points: SalinityPoint[] = stations.map((station: any) => {
            const stat = stats.find(
              (s: any) => s.stationCode === station.stationCode
            );
            return {
              ...station,
              salinity: stat?.salinity ?? 30,
              avgTemp: stat?.avgTemp ?? 20,
            };
          });

          // 在添加标记点之前，先添加热力图层
          map.current.addSource("salinity-heatmap", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                // 在站点之间插值生成更多数据点以实现平滑过渡
                ...points.flatMap((point) => {
                  const features = [];
                  // 以站点为中心，生成一些随机点
                  for (let i = 0; i < 15; i++) {
                    const offset = (Math.random() - 0.5) * 0.5; // ±0.25度范围内
                    features.push({
                      type: "Feature",
                      properties: {
                        salinity: point.salinity - Math.abs(offset) * 2, // 距离站点越远，盐度越低
                      },
                      geometry: {
                        type: "Point",
                        coordinates: [
                          point.longitude + offset,
                          point.latitude + (Math.random() - 0.5) * 0.5,
                        ],
                      },
                    });
                  }
                  return features;
                }),
              ],
            },
          });

          map.current.addLayer({
            id: "salinity-heat",
            type: "heatmap",
            source: "salinity-heatmap",
            paint: {
              // 热力图权重
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "salinity"],
                28,
                0,
                32,
                1,
              ],
              // 热力图强度
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                0.5,
                8,
                1,
              ],
              // 热力图颜色渐变
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(33,102,172,0)",
                0.2,
                "rgba(103,169,207,0.4)",
                0.4,
                "rgba(209,229,240,0.6)",
                0.6,
                "rgba(253,219,199,0.7)",
                0.8,
                "rgba(239,138,98,0.8)",
                1,
                "rgba(178,24,43,0.9)",
              ],
              // 热力图半径
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                30,
                8,
                50,
              ],
              // 热力图不透明度
              "heatmap-opacity": 0.7,
            },
          });

          // 添加标记点
          points.forEach((point) => {
            // 创建标记元素
            const el = document.createElement("div");
            const size = Math.max(
              20,
              Math.min(40, 20 + (point.salinity - 28) * 4)
            );

            el.className = "station-marker";
            el.style.cssText =
              `width:${size}px;` +
              `height:${size}px;` +
              `background-color:rgba(59,130,246,${Math.min(
                1,
                (point.salinity - 28) / 4
              )});` +
              "border-radius:50%;" +
              "cursor:pointer;" +
              "border:2px solid white;" +
              "box-shadow:0 2px 4px rgba(0,0,0,0.2);" +
              "transition:all 0.3s ease;";

            el.addEventListener("mouseenter", () => {
              el.style.transform = "scale(1.1)";
            });

            el.addEventListener("mouseleave", () => {
              el.style.transform = "scale(1)";
            });

            // 创建弹出框
            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div class="p-3 min-w-[200px]">
                <h3 class="font-medium text-lg mb-2">${point.stationName}</h3>
                <div class="space-y-1">
                  <p class="text-sm">
                    <span class="text-muted-foreground">盐度:</span> 
                    <span class="font-medium">${point.salinity.toFixed(
                      3
                    )}‰</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-muted-foreground">平均温度:</span> 
                    <span class="font-medium">${point.avgTemp.toFixed(
                      1
                    )}°C</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-muted-foreground">位置:</span> 
                    <span class="font-medium">${point.latitude.toFixed(
                      3
                    )}°N, ${point.longitude.toFixed(3)}°E</span>
                  </p>
                </div>
              </div>
            `);

            // 添加标记到地图
            new maplibregl.Marker(el)
              .setLngLat([point.longitude, point.latitude])
              .setPopup(popup)
              .addTo(map.current);
          });

          setLoading(false);
        } catch (error) {
          console.error("Error loading data:", error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

//   if (loading) {
//     return <Skeleton className="h-[600px] w-full rounded-lg" />;
//   }

  return (
    <Card className="relative">
      <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
    </Card>
  );
}
