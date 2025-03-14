import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface StatsData {
  max: number;
  min: number;
  avg: number;
  trend: number;
  // 特殊统计指标（可选）
  h13?: number;
  h110?: number;
  h113?: number;
  t13?: number;
  t110?: number;
  t113?: number;
  // 其他可能的统计指标
  [key: string]: number | undefined;
}

// 定义统计指标项配置
export interface StatItem {
  key: string; // 数据键名
  label: string; // 显示标签
  format?: (value: number, unit: string) => string; // 可选的格式化函数
}

interface StatsCardProps {
  title: string;
  stats: StatsData | null;
  unit: string;
  color: string;
  statItems?: StatItem[]; // 统计指标项配置数组
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
  statItems,
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

  // 默认显示的基础统计指标
  const defaultStatItems: StatItem[] = [
    { key: "max", label: "最高" },
    { key: "min", label: "最低" },
    { key: "avg", label: "平均" },
  ];

  // 合并默认项和传入的自定义项
  const displayItems = statItems || defaultStatItems;

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
          {displayItems.map(
            (item) =>
              stats[item.key] !== undefined && (
                <div key={item.key} className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-xl font-bold">
                    {item.format
                      ? item.format(stats[item.key] as number, unit)
                      : `${(stats[item.key] as number).toFixed(2)}${unit}`}
                  </span>
                </div>
              )
          )}
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
