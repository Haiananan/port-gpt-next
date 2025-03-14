"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCoastalData, fetchAllCoastalData } from "@/services/coastalApi";
import { CoastalQueryForm } from "@/components/CoastalQueryForm";
import { CoastalDataTable } from "@/components/CoastalDataTable";
import { CoastalAirTemperatureChart } from "@/components/CoastalAirTemperatureChart";
import { CoastalSeaTemperatureChart } from "@/components/CoastalSeaTemperatureChart";
import { CoastalWindChart } from "@/components/CoastalWindChart";
import { CoastalPressureChart } from "@/components/CoastalPressureChart";
import { CoastalWavePeriodChart } from "@/components/CoastalWavePeriodChart";
import { CoastalWaveHeightChart } from "@/components/CoastalWaveHeightChart";
import { CoastalStats } from "@/components/CoastalStats";
import { Header } from "@/components/ui/header";
import { CoastalWindSpeedChart } from "@/components/CoastalWindSpeedChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, Table2 } from "lucide-react";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { CoastalCurrentChart } from "@/components/CoastalCurrentChart";
import { CoastalWaterLevelChart } from "@/components/CoastalWaterLevelChart";

export default function DataQueryComponent() {
  const [station, setStation] = useState<string>("XCS");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date("2023-07-01")
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date("2023-07-31")
  );
  const [page, setPage] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取分页表格数据
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

  // 获取所有时间范围内的原始数据，用于极值分析
  const { data: allData, isLoading: isLoadingAllData } = useQuery({
    queryKey: [
      "allData",
      station || null,
      startDate?.toISOString() || null,
      endDate?.toISOString() || null,
    ] as const,
    queryFn: () =>
      fetchAllCoastalData(
        station || null,
        startDate?.toISOString() || null,
        endDate?.toISOString() || null
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
      <ScrollToTop />
      <Header />
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
          <div>
            {isClient ? (
              <div>
                <Tabs defaultValue="charts" className="w-full">
                  <div className="flex justify-start mb-6">
                    <TabsList className="inline-flex">
                      <TabsTrigger
                        value="charts"
                        className="flex items-center gap-2"
                      >
                        <ChartBar className="h-4 w-4" />
                        图表可视化
                      </TabsTrigger>
                      <TabsTrigger
                        value="table"
                        className="flex items-center gap-2"
                      >
                        <Table2 className="h-4 w-4" />
                        数据表格
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="charts" className="space-y-6">
                    {isLoadingAllData ? (
                      <div className="h-[200px] w-full flex items-center justify-center">
                        <Skeleton className="h-[150px] w-full" />
                      </div>
                    ) : (
                      <CoastalStats
                        station={station}
                        startDate={startDate}
                        endDate={endDate}
                        data={allData}
                      />
                    )}
                    <div className="grid grid-cols-1 gap-6">
                      <CoastalAirTemperatureChart
                        station={station}
                        startDate={startDate}
                        endDate={endDate}
                      />
                      <CoastalSeaTemperatureChart
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
                      <CoastalCurrentChart
                        station={station}
                        startDate={startDate}
                        endDate={endDate}
                      />
                      <CoastalWaterLevelChart
                        station={station}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    </div>
                    <div className="mt-6">
                      <CoastalWindChart
                        station={station}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="table" className="min-h-[500px]">
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-[500px] w-full" />
                      </div>
                    ) : error ? (
                      <Alert variant="destructive">
                        <AlertDescription>
                          错误: {error.message}
                        </AlertDescription>
                      </Alert>
                    ) : data ? (
                      <CoastalDataTable
                        data={data.data}
                        total={data.pagination.total}
                        page={data.pagination.page}
                        totalPages={data.pagination.totalPages}
                        onPageChange={setPage}
                      />
                    ) : null}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Skeleton className="h-[400px] w-full" />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
