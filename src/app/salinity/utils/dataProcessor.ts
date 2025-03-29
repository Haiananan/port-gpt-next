import { PrismaClient } from "@prisma/client";
import { cache } from "react";

const prisma = new PrismaClient();

export const getStations = cache(async () => {
  const stations = await prisma.$queryRaw<
    Array<{
      stationCode: string;
      stationName: string;
      latitude: number;
      longitude: number;
    }>
  >`
    SELECT DISTINCT stationCode, stationName, latitude, longitude
    FROM SalinityData
  `;
  return stations;
});

export const getSalinityTrends = cache(async () => {
  const trends = await prisma.$queryRaw<
    Array<{
      stationCode: string;
      year: number;
      month: number;
      avgSalinity: number;
    }>
  >`
    SELECT 
      stationCode,
      strftime('%Y', date) as year,
      strftime('%m', date) as month,
      AVG(salinity) as avgSalinity
    FROM SalinityData
    GROUP BY stationCode, year, month
    ORDER BY year, month
  `;
  return trends;
});

export const getLatestData = cache(async () => {
  const latest = await prisma.$queryRaw<
    Array<{
      stationCode: string;
      stationName: string;
      date: Date;
      salinity: number;
      temp08: number;
      temp14: number;
      temp20: number;
    }>
  >`
    SELECT *
    FROM SalinityData
    WHERE date IN (
      SELECT MAX(date)
      FROM SalinityData
      GROUP BY stationCode
    )
  `;
  return latest;
}); 