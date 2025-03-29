"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Target, AlertTriangle, TrendingUp, Scale } from "lucide-react";
import { getPredictionTrends, getLatestDataset } from "../utils/dataProcessor";

export default function PredictionSection() {
  const predictions = getPredictionTrends();
  const latestData = getLatestDataset();
  const latestPrediction = predictions[predictions.length - 1];
  
  // 计算预测区间
  const predictionData = Array.from({ length: 31 }, (_, i) => ({
    year: latestData.annualData[0].year + i,
    min: i * latestPrediction.min,
    max: i * latestPrediction.max,
    trend: i * (latestPrediction.min + latestPrediction.max) / 2,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Target className="text-blue-500" size={24} />
            <div>
              <h3 className="font-medium">预测年限</h3>
              <p className="text-2xl font-bold text-blue-500 mt-1">
                {latestData.predictions.period}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  年
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Scale className="text-green-500" size={24} />
            <div>
              <h3 className="font-medium">预测区间</h3>
              <p className="text-2xl font-bold text-green-500 mt-1">
                {(latestPrediction.max - latestPrediction.min).toFixed(1)}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  毫米
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="text-orange-500" size={24} />
            <div>
              <h3 className="font-medium">最小上升</h3>
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {latestPrediction.min.toFixed(1)}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  毫米/年
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
              <h3 className="font-medium">最大上升</h3>
              <p className="text-2xl font-bold text-red-500 mt-1">
                {latestPrediction.max.toFixed(1)}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  毫米/年
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">海平面上升预测</h3>
          <p className="text-sm text-muted-foreground mt-1">
            未来{latestData.predictions.period}年海平面上升预测区间
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis
              dataKey="year"
              label={{ value: "年份", position: "bottom" }}
            />
            <YAxis
              label={{
                value: "海平面上升(毫米)",
                angle: -90,
                position: "insideLeft",
              }}
            />
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
            <Area
              type="monotone"
              dataKey="max"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.1}
              strokeWidth={2}
              name="最大预测"
            />
            <Area
              type="monotone"
              dataKey="min"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
              name="最小预测"
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="平均趋势"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border-2 border-red-500" />
            <span>最大预测</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-500" />
            <span>最小预测</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-green-500" />
            <span>平均趋势</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
