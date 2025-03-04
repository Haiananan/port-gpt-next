"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCoastalData } from "@/services/coastalApi";
import { CoastalQueryForm } from "@/components/CoastalQueryForm";
import { CoastalDataTable } from "@/components/CoastalDataTable";
import { CoastalTemperatureChart } from "@/components/CoastalTemperatureChart";
import { CoastalWindChart } from "@/components/CoastalWindChart";
import { CoastalPressureChart } from "@/components/CoastalPressureChart";
import { CoastalWavePeriodChart } from "@/components/CoastalWavePeriodChart";
import { CoastalWaveHeightChart } from "@/components/CoastalWaveHeightChart";
import { CoastalStats } from "@/components/CoastalStats";
import { Header } from "@/components/ui/header";
import { CoastalWindSpeedChart } from "@/components/CoastalWindSpeedChart";

export default function DataQueryComponent() {
  const [station, setStation] = useState<string>("XCS");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date("2023-07-01")
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date("2023-07-31")
  );
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
    enabled: Boolean(startDate && endDate && station),
  });

  const handleReset = () => {
    setStation("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const handleDateRangeChange = (
    start: Date | undefined,
    end: Date | undefined
  ) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    setPage(1);
  }, [station, startDate, endDate]);

  return (
    <main className="min-h-screen">
      <Header />
      <div className=" p-4 space-y-6 mx-auto">
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
            <CoastalStats
              station={station}
              startDate={startDate}
              endDate={endDate}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CoastalTemperatureChart
                station={station}
                startDate={startDate}
                endDate={endDate}
              />

              <CoastalPressureChart
                station={station}
                startDate={startDate}
                endDate={endDate}
              />

              <CoastalWaveHeightChart
                station={station}
                startDate={startDate}
                endDate={endDate}
              />

              <CoastalWavePeriodChart
                station={station}
                startDate={startDate}
                endDate={endDate}
              />
              <CoastalWindSpeedChart
                station={station}
                startDate={startDate}
                endDate={endDate}
              />
              <div className=" col-span-2">
                <CoastalWindChart
                  station={station}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>

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
    </main>
  );
}
