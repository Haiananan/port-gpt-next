import { StatsCard, StatItem } from "@/components/ui/stats-card";
import {
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  Waves,
  Timer,
  Ruler,
  Navigation2,
  Compass,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchStatsData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ExtremeValueAnalysis } from "@/components/ExtremeValueAnalysis";

interface CoastalStatsProps {
  station: string;
  startDate: Date;
  endDate: Date;
  data?: any[]; // 可选的原始数据，用于极值分析
}

// 定义各类统计指标配置
const statsItemConfigs: { [key: string]: StatItem[] } = {
  // 基础统计 - 所有类型共用
  base: [
    { key: "max", label: "最高" },
    { key: "min", label: "最低" },
    { key: "avg", label: "平均" },
  ],
  // 波高特殊统计
  waveHeight: [
    { key: "max", label: "最高" },
    { key: "min", label: "最低" },
    { key: "avg", label: "平均" },
    { key: "h13", label: "H1/3" },
    { key: "h110", label: "H1/10" },
    { key: "h113", label: "H1/13" },
  ],
  // 周期特殊统计
  wavePeriod: [
    { key: "max", label: "最高" },
    { key: "min", label: "最低" },
    { key: "avg", label: "平均" },
    { key: "t13", label: "T1/3" },
    { key: "t110", label: "T1/10" },
    { key: "t113", label: "T1/13" },
  ],
  // 风速特殊统计
  windSpeed: [
    { key: "max", label: "最高" },
    { key: "min", label: "最低" },
    { key: "avg", label: "平均" },
  ],
};

const statsConfig = [
  {
    title: "气温",
    unit: "°C",
    color: "hsl(0 84.2% 60.2%)",
    icon: Thermometer,
    key: "temperature",
    statItems: statsItemConfigs.base,
    span: 4,
  },
  {
    title: "海温",
    unit: "°C",
    color: "hsl(201, 100%, 50%)",
    icon: Droplets,
    key: "seaTemperature",
    statItems: statsItemConfigs.base,
    span: 4,
  },

  {
    title: "风速",
    unit: "m/s",
    color: "hsl(142.1 76.2% 36.3%)",
    icon: Wind,
    key: "windSpeed",
    statItems: statsItemConfigs.windSpeed,
    span: 4,
  },
  {
    title: "气压",
    unit: "hPa",
    color: "hsl(35.3 91.2% 51.6%)",
    icon: Gauge,
    key: "pressure",
    statItems: statsItemConfigs.base,
    span: 4,
  },
  {
    title: "水位",
    unit: "m",
    color: "hsl(190, 90%, 50%)",
    icon: Ruler,
    key: "waterLevel",
    statItems: statsItemConfigs.base,
    span: 4,
  },
  {
    title: "流速",
    unit: "m/s",
    color: "hsl(150, 90%, 40%)",
    icon: Navigation2,
    key: "currentSpeed",
    statItems: statsItemConfigs.base,
    span: 4,
  },
  {
    title: "浪高",
    unit: "m",
    color: "hsl(35.3 91.2% 51.6%)",
    icon: Waves,
    key: "waveHeight",
    statItems: statsItemConfigs.waveHeight,
    span: 6,
  },
  {
    title: "浪周期",
    unit: "s",
    color: "hsl(262.1 83.3% 57.8%)",
    icon: Timer,
    key: "wavePeriod",
    statItems: statsItemConfigs.wavePeriod,
    span: 6,
  },
];

export function CoastalStats({
  station,
  startDate,
  endDate,
  data,
}: CoastalStatsProps) {
  // 使用useState的延迟初始化函数来避免Hydration不匹配
  const [showExtremeAnalysis, setShowExtremeAnalysis] = useState(() => false);
  const [analysisKey, setAnalysisKey] = useState<string | null>(null);
  // 添加客户端渲染标记，避免SSR和客户端渲染不一致
  const [isClient, setIsClient] = useState(false);

  // 在客户端渲染后设置isClient为true
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: statsData, isLoading } = useQuery({
    queryKey: [
      "stats",
      station,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () =>
      fetchStatsData(station, startDate.toISOString(), endDate.toISOString()),
    enabled: Boolean(station && startDate && endDate),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statsConfig.map((config) => (
          <Card key={config.title} className="p-6">
            <Skeleton className="h-[120px] w-full" />
          </Card>
        ))}
      </div>
    );
  }

  // 找到当前选择的配置
  const currentConfig = analysisKey
    ? statsConfig.find((config) => config.key === analysisKey)
    : null;

  // 确保只在客户端渲染交互性内容
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">数据统计</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 mb-6">
        {statsConfig.map((config) => (
          <div key={config.key} className={`col-span-${config.span}`}>
            <StatsCard
              title={config.title}
              stats={
                statsData
                  ? statsData[config.key as keyof typeof statsData]
                  : null
              }
              unit={config.unit}
              color={config.color}
              icon={config.icon}
              statItems={config.statItems}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
