"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StationCardProps {
  stationName?: string;
  salinity?: number;
  temp?: number;
}

export default function StationCard({ stationName, salinity, temp }: StationCardProps = {}) {
  if (!stationName) {
    return <Skeleton className="h-[120px] w-full" />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-2">{stationName}</h3>
        <div className="space-y-1 text-sm">
          <p>盐度: {salinity?.toFixed(3)}‰</p>
          <p>温度: {temp?.toFixed(1)}°C</p>
        </div>
      </CardContent>
    </Card>
  );
} 