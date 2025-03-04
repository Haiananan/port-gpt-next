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

// 获取图表数据（不分页，只获取气温数据）
export const fetchTemperatureData = async (
  station: string,
  startDate: string,
  endDate: string
): Promise<CoastalStationData[]> => {
  const params = new URLSearchParams({
    station,
    startDate,
    endDate,
    fields: "date,airTemperature", // 只获取需要的字段
  });

  const response = await fetch(`/api/chartData?${params.toString()}`);
  if (!response.ok) {
    throw new Error("网络请求失败");
  }
  return response.json();
};
