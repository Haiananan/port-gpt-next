import { PaginatedResponse, CoastalStationData } from "@/types/coastal";

// 获取表格分页数据
export const fetchCoastalData = async (
  station: string | null,
  startDate: string | null,
  endDate: string | null,
  page: number
): Promise<PaginatedResponse> => {
  const params = new URLSearchParams();
  if (station) params.append("station", station);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  params.append("page", page.toString());
  params.append("pageSize", "200");

  const response = await fetch(`/api/queryData?${params.toString()}`);
  if (!response.ok) {
    throw new Error("网络请求失败");
  }
  return response.json();
};

// 获取图表数据（不分页）
export const fetchTemperatureData = async (
  station: string,
  startDate: string,
  endDate: string,
  fields: string[] = ["date", "airTemperature", "seaTemperature"]
): Promise<CoastalStationData[]> => {
  const params = new URLSearchParams({
    station,
    startDate,
    endDate,
    fields: fields.join(","), // 动态字段列表
  });

  const response = await fetch(`/api/chartData?${params.toString()}`);
  if (!response.ok) {
    throw new Error("网络请求失败");
  }
  return response.json();
};

// 获取风向和风速数据
export async function fetchWindData(
  station: string,
  startDate: string,
  endDate: string,
  fields: string[] = ["date", "windDirection", "windSpeed"]
): Promise<CoastalStationData[]> {
  const params = new URLSearchParams({
    station,
    startDate,
    endDate,
    fields: fields.join(","),
  });

  const response = await fetch(`/api/chartData?${params.toString()}`);
  if (!response.ok) {
    throw new Error("获取风向风速数据失败");
  }

  return response.json();
}

export async function fetchPressureData(
  station: string,
  startDate: string,
  endDate: string
): Promise<CoastalStationData[]> {
  const params = new URLSearchParams({
    station,
    startDate,
    endDate,
    fields: "date,airPressure",
  });

  const response = await fetch(`/api/chartData?${params.toString()}`);
  if (!response.ok) {
    throw new Error("获取气压数据失败");
  }
  return response.json();
}

export async function fetchWaveData(
  station: string,
  startDate: string,
  endDate: string
): Promise<CoastalStationData[]> {
  const params = new URLSearchParams({
    station,
    startDate,
    endDate,
    fields: "date,windWaveHeight,windWavePeriod",
  });

  const response = await fetch(`/api/chartData?${params.toString()}`);
  if (!response.ok) {
    throw new Error("获取风浪数据失败");
  }
  return response.json();
}

export interface StatsResponse {
  temperature: {
    max: number;
    min: number;
    avg: number;
    trend: number;
  };
  seaTemperature: {
    max: number;
    min: number;
    avg: number;
    trend: number;
  };
  pressure: {
    max: number;
    min: number;
    avg: number;
    trend: number;
  };
  windSpeed: {
    max: number;
    min: number;
    avg: number;
    trend: number;
  };
  waveHeight: {
    max: number;
    min: number;
    avg: number;
    trend: number;
  };
  wavePeriod: {
    max: number;
    min: number;
    avg: number;
    trend: number;
  };
}

export async function fetchStatsData(
  station: string,
  startDate: string,
  endDate: string
): Promise<StatsResponse> {
  const response = await fetch(
    `/api/stats?station=${station}&startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw new Error("获取统计数据失败");
  }

  const data = await response.json();
  return data;
}
