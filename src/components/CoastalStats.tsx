import { StatsCard } from "@/components/ui/stats-card";
import { Thermometer, Droplets, Gauge, Wind, Waves, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchStatsData } from "@/services/coastalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface CoastalStatsProps {
  station: string;
  startDate: Date;
  endDate: Date;
}

const statsConfig = [
  {
    title: "气温",
    unit: "°C",
    color: "hsl(0 84.2% 60.2%)",
    icon: Thermometer,
    key: "temperature",
    showWaveStats: false,
  },
  {
    title: "海温",
    unit: "°C",
    color: "hsl(201, 100%, 50%)",
    icon: Droplets,
    key: "seaTemperature",
    showWaveStats: false,
  },
  {
    title: "气压",
    unit: "hPa",
    color: "hsl(35.3 91.2% 51.6%)",
    icon: Gauge,
    key: "pressure",
    showWaveStats: false,
  },
  {
    title: "风速",
    unit: "m/s",
    color: "hsl(142.1 76.2% 36.3%)",
    icon: Wind,
    key: "windSpeed",
    showWaveStats: false,
  },
  {
    title: "浪高",
    unit: "m",
    color: "hsl(35.3 91.2% 51.6%)",
    icon: Waves,
    key: "waveHeight",
    showWaveStats: true,
  },
  {
    title: "浪周期",
    unit: "s",
    color: "hsl(262.1 83.3% 57.8%)",
    icon: Timer,
    key: "wavePeriod",
    showWaveStats: true,
  },
];

export function CoastalStats({
  station,
  startDate,
  endDate,
}: CoastalStatsProps) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {statsConfig.map((config) => (
        <StatsCard
          key={config.title}
          title={config.title}
          stats={
            statsData ? statsData[config.key as keyof typeof statsData] : null
          }
          unit={config.unit}
          color={config.color}
          icon={config.icon}
          showWaveStats={config.showWaveStats}
        />
      ))}
    </div>
  );
}
