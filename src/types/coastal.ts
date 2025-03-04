export interface CoastalStationData {
  id: number;
  station: string;
  date: string;
  latitude: number;
  longitude: number;
  visibility: number | null;
  airTemperature: number | null;
  windDirection: number | null;
  windSpeed: number | null;
  airPressure: number | null;
  precipitation: number | null;
  seaTemperature: number | null;
  windWaveHeight: number | null;
  windWavePeriod: number | null;
  surgeHeight: number | null;
  surgePeriod: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface PaginatedResponse {
  data: CoastalStationData[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
