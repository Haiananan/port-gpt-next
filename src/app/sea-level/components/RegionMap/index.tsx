"use client";

import dynamic from "next/dynamic";

// 动态导入地图组件，禁用 SSR
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

export default function RegionMap() {
  return <MapComponent />;
}
