"use client";

import { Card } from "@/components/ui/card";
import { getExtremeEvents } from "../utils/dataProcessor";
import { AlertTriangle, Waves, ArrowUp, ArrowDown } from "lucide-react";
import { MonthlyExtreme } from "@/data/sea-level/types";

export default function YearlyHighlights() {
  const events = getExtremeEvents();
  const latestEvents = events[events.length - 1];

  // 计算统计数据
  const stats = events.reduce(
    (
      acc: {
        highCount: number;
        lowCount: number;
        maxValue: number;
        minValue: number;
        maxEvent: MonthlyExtreme | null;
        minEvent: MonthlyExtreme | null;
      },
      { events }
    ) => {
      events.forEach((event) => {
        if (event.type === "high") acc.highCount++;
        if (event.type === "low") acc.lowCount++;
        if (event.anomaly > acc.maxValue) {
          acc.maxValue = event.anomaly;
          acc.maxEvent = event;
        }
        if (event.anomaly < acc.minValue) {
          acc.minValue = event.anomaly;
          acc.minEvent = event;
        }
      });
      return acc;
    },
    {
      highCount: 0,
      lowCount: 0,
      maxValue: -Infinity,
      minValue: Infinity,
      maxEvent: null,
      minEvent: null,
    }
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <ArrowUp className="text-red-500" size={24} />
            <div>
              <h3 className="font-medium">极端高值</h3>
              <p className="text-2xl font-bold text-red-500 mt-1">
                {stats.highCount}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  次
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <ArrowDown className="text-blue-500" size={24} />
            <div>
              <h3 className="font-medium">极端低值</h3>
              <p className="text-2xl font-bold text-blue-500 mt-1">
                {stats.lowCount}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  次
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Waves className="text-orange-500" size={24} />
            <div>
              <h3 className="font-medium">历史最高</h3>
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {stats.maxValue.toFixed(1)}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  毫米
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.maxEvent?.date} {stats.maxEvent?.location}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Waves className="text-indigo-500" size={24} />
            <div>
              <h3 className="font-medium">历史最低</h3>
              <p className="text-2xl font-bold text-indigo-500 mt-1">
                {stats.minValue.toFixed(1)}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  毫米
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.minEvent?.date} {stats.minEvent?.location}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            最新极值事件
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {latestEvents.year}年极值事件记录
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestEvents.events.map((event, index) => (
            <Card
              key={index}
              className={`p-4 border-l-4 ${
                event.type === "high"
                  ? "border-l-red-500 bg-red-50/50"
                  : "border-l-blue-500 bg-blue-50/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{event.area}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.month}月
                  </p>
                </div>
                <span
                  className={`text-lg font-bold ${
                    event.type === "high" ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {event.anomaly.toFixed(1)}
                  <span className="text-sm font-normal ml-1">毫米</span>
                </span>
              </div>
              {event.note && (
                <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                  {event.note}
                </p>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
