import { PaginatedResponse } from "@/types/coastal";

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
