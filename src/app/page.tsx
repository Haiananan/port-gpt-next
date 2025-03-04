"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCoastalData } from "@/services/coastalApi";
import { CoastalQueryForm } from "@/components/CoastalQueryForm";
import { CoastalDataTable } from "@/components/CoastalDataTable";
import { CoastalTemperatureChart } from "@/components/CoastalTemperatureChart";

export default function DataQueryComponent() {
  const [station, setStation] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useQuery({
    queryKey: [
      "tableData",
      station || null,
      startDate?.toISOString() || null,
      endDate?.toISOString() || null,
      page,
    ] as const,
    queryFn: () =>
      fetchCoastalData(
        station || null,
        startDate?.toISOString() || null,
        endDate?.toISOString() || null,
        page
      ),
    enabled: Boolean(startDate && endDate && station), // 只在有完整查询条件时才发起请求
  });

  // 重置所有条件
  const handleReset = () => {
    setStation("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (
    start: Date | undefined,
    end: Date | undefined
  ) => {
    setStartDate(start);
    setEndDate(end);
  };

  // 当查询条件改变时重置分页
  useEffect(() => {
    setPage(1);
  }, [station, startDate, endDate]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <CoastalQueryForm
        station={station}
        startDate={startDate}
        endDate={endDate}
        onStationChange={setStation}
        onDateRangeChange={handleDateRangeChange}
        onReset={handleReset}
      />

      {!station || !startDate || !endDate ? (
        <Alert>
          <AlertDescription>请选择站点和日期范围以查看数据</AlertDescription>
        </Alert>
      ) : (
        <>
          <CoastalTemperatureChart
            station={station}
            startDate={startDate}
            endDate={endDate}
          />

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-[400px] w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>错误: {error.message}</AlertDescription>
            </Alert>
          )}

          {data && (
            <CoastalDataTable
              data={data.data}
              total={data.pagination.total}
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
