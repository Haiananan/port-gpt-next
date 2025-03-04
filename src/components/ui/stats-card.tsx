import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface StatsData {
  max: number;
  min: number;
  avg: number;
  trend: number;
}

interface StatsCardProps {
  title: string;
  stats: StatsData | null;
  unit: string;
  color: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

export function StatsCard({
  title,
  stats,
  unit,
  color,
  icon: Icon,
}: StatsCardProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">暂无数据</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <Icon className="h-4 w-4" style={{ color }} />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">最高</span>
            <span className="text-xl font-bold">
              {stats.max.toFixed(2)}
              {unit}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">最低</span>
            <span className="text-xl font-bold">
              {stats.min.toFixed(2)}
              {unit}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">平均</span>
            <span className="text-xl font-bold">
              {stats.avg.toFixed(2)}
              {unit}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">
            {stats.trend > 0 ? "上升" : "下降"}
          </span>
          <span className="font-medium" style={{ color }}>
            {Math.abs(stats.trend).toFixed(2)}
            {unit}
          </span>
          {stats.trend > 0 ? (
            <TrendingUp className="h-4 w-4" style={{ color }} />
          ) : (
            <TrendingDown className="h-4 w-4" style={{ color }} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
