"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getRegionalTrends } from "../utils/dataProcessor";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REGION_METADATA = {
  bohai: {
    name: "渤海",
    color: "#8884d8",
    icon: "🌊",
    description: "受气候变化影响显著",
  },
  yellowSea: {
    name: "黄海",
    color: "#82ca9d",
    icon: "🌅",
    description: "海平面变化相对稳定",
  },
  eastSea: {
    name: "东海",
    color: "#ffc658",
    icon: "🌊",
    description: "受台风影响较大",
  },
  southSea: {
    name: "南海",
    color: "#ff7300",
    icon: "🏖️",
    description: "年际变化显著",
  },
};

export default function RegionalComparison() {
  const regionalData = getRegionalTrends();
  const years = [...new Set(Object.values(regionalData).flat().map(d => d.year))].sort();

  // 计算各区域的统计数据
  const stats = Object.entries(regionalData).map(([region, data]) => {
    const values = data.map(d => d.value);
    return {
      region,
      name: REGION_METADATA[region as keyof typeof REGION_METADATA].name,
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      current: data[data.length - 1].value,
    };
  });

  // 转换数据格式用于折线图
  const chartData = years.map(year => {
    const point: any = { year };
    Object.entries(regionalData).forEach(([region, data]) => {
      const yearData = data.find(d => d.year === year);
      if (yearData) {
        point[region] = yearData.value;
      }
    });
    return point;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ region, name, max, min, avg, current }) => {
          const metadata = REGION_METADATA[region as keyof typeof REGION_METADATA];
          const isPositive = current > 0;
          
          return (
            <Card key={region} className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="p-4 border-b"
                  style={{ 
                    backgroundColor: `${metadata.color}15`,
                    borderColor: `${metadata.color}30`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span>{metadata.icon}</span>
                      <span>{name}</span>
                    </h4>
                    <div 
                      className={`text-sm px-2 py-1 rounded-full font-medium ${
                        isPositive ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isPositive ? '↑' : '↓'} {Math.abs(current).toFixed(1)}mm
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metadata.description}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">历史最高</span>
                    <span className="font-medium">{max.toFixed(1)}毫米</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">历史最低</span>
                    <span className="font-medium">{min.toFixed(1)}毫米</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">平均偏差</span>
                    <span className="font-medium">{avg.toFixed(1)}毫米</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full mt-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((current - min) / (max - min)) * 100}%`,
                        backgroundColor: metadata.color,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="trend">
            <TabsList className="w-full max-w-[400px] grid grid-cols-2">
              <TabsTrigger value="trend">整体趋势</TabsTrigger>
              <TabsTrigger value="comparison">分区对比</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trend" className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">海区海平面变化趋势</h3>
                <p className="text-sm text-muted-foreground">
                  展示各海区历年海平面变化情况
                </p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year"
                    label={{ value: "年份", position: "bottom" }}
                  />
                  <YAxis
                    label={{
                      value: "海平面偏差(毫米)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}毫米`]}
                    labelFormatter={(label) => `${label}年`}
                  />
                  <Legend />
                  {Object.entries(REGION_METADATA).map(([key, metadata]) => (
                    <Line
                      key={key}
                      name={metadata.name}
                      type="monotone"
                      dataKey={key}
                      stroke={metadata.color}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="comparison" className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">分区趋势对比</h3>
                <p className="text-sm text-muted-foreground">
                  对比各海区的独立变化趋势
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(regionalData).map(([region, data]) => {
                  const metadata = REGION_METADATA[region as keyof typeof REGION_METADATA];
                  return (
                    <Card key={region} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div 
                          className="p-4 border-b flex items-center gap-2"
                          style={{ 
                            backgroundColor: `${metadata.color}15`,
                            borderColor: `${metadata.color}30`
                          }}
                        >
                          <span>{metadata.icon}</span>
                          <h4 className="font-medium">{metadata.name}趋势分析</h4>
                        </div>
                        <div className="p-4">
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                              <XAxis 
                                dataKey="year"
                                fontSize={12}
                                tickMargin={8}
                              />
                              <YAxis fontSize={12} />
                              <Tooltip
                                formatter={(value: number) => [`${value.toFixed(1)}毫米`]}
                                labelFormatter={(label) => `${label}年`}
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={metadata.color}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
