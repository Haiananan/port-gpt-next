import { Card } from "@/components/ui/card";
import { Droplets } from "lucide-react";

interface StationCardProps {
  stationName?: string;
  salinity?: number;
  temp?: number;
  date?: Date;
}

export default function StationCard({
  stationName = "石岛",
  salinity = 32.5,
  temp = 25.6,
  date = new Date(),
}: StationCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Droplets className="text-blue-500" size={24} />
        <div>
          <h3 className="font-medium">{stationName}</h3>
          <p className="text-2xl font-bold text-blue-500 mt-1">
            {salinity.toFixed(3)}
            <span className="text-base font-normal text-muted-foreground ml-1">
              ‰
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {temp.toFixed(1)}°C | {date.toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
} 