"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import TrendChart from "./TrendChart";

const INTERVALS = [
  { value: "month", label: "月度趋势" },
  { value: "year", label: "年度趋势" },
];

export default function TrendAnalysis() {
  const [interval, setInterval] = useState("month");

  const { data: trends, isLoading } = useQuery({
    queryKey: ["salinity-trends", interval],
    queryFn: async () => {
      const res = await fetch(`/api/salinity/trends?interval=${interval}`);
      return res.json();
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">趋势分析</h3>
        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择时间间隔" />
          </SelectTrigger>
          <SelectContent>
            {INTERVALS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-[400px]" />
      ) : (
        <TrendChart data={trends} interval={interval} />
      )}
    </div>
  );
} 