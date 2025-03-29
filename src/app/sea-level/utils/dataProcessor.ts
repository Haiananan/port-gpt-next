import {
  seaLevel2011,
  seaLevel2012,
  seaLevel2013,
  seaLevel2014,
  seaLevel2015,
  seaLevel2017,
  seaLevel2018,
  seaLevel2019,
  seaLevel2020,
  seaLevel2021,
  seaLevel2022,
  SeaLevelDataset,
} from "@/data/sea-level";

// 所有年份的数据集合
const allDatasets = [
  seaLevel2011,
  seaLevel2012,
  seaLevel2013,
  seaLevel2014,
  seaLevel2015,
  seaLevel2017,
  seaLevel2018,
  seaLevel2019,
  seaLevel2020,
  seaLevel2021,
  seaLevel2022,
];

// 获取所有年份的年均海平面数据
export const getAnnualMeanLevels = () => {
  return allDatasets.map((dataset) => ({
    year: dataset.annualData[0].year,
    meanLevel: dataset.annualData[0].annual.meanLevel,
    isHistoricalHigh: dataset.annualData[0].annual.isHistoricalHigh,
  }));
};

// 获取各海区的历年变化数据
export const getRegionalTrends = () => {
  const regions = ["bohai", "yellowSea", "eastSea", "southSea"] as const;
  const regionalData: Record<
    (typeof regions)[number],
    { year: number; value: number }[]
  > = {
    bohai: [],
    yellowSea: [],
    eastSea: [],
    southSea: [],
  };

  allDatasets.forEach((dataset) => {
    const year = dataset.annualData[0].year;
    regions.forEach((region) => {
      regionalData[region].push({
        year,
        value: dataset.annualData[0].regional[region].comparedToNormal,
      });
    });
  });

  return regionalData;
};

// 获取长期趋势数据
export const getLongTermTrends = () => {
  return allDatasets.map((dataset) => ({
    year: dataset.annualData[0].year,
    riseRate: dataset.longTermTrends.periods[0].riseRate,
  }));
};

// 获取预测数据变化趋势
export const getPredictionTrends = () => {
  return allDatasets.map((dataset) => ({
    year: dataset.annualData[0].year,
    min: dataset.predictions.riseRange.min,
    max: dataset.predictions.riseRange.max,
  }));
};

// 获取极值事件统计
export const getExtremeEvents = () => {
  return allDatasets.map((dataset) => ({
    year: dataset.annualData[0].year,
    events: dataset.annualData[0].monthlyExtremes,
  }));
};

// 获取最新的数据集
export const getLatestDataset = () => {
  return allDatasets[allDatasets.length - 1];
};

// 计算年际变化率
export const getInterannualChanges = () => {
  const sortedData = [...allDatasets].sort(
    (a, b) => a.annualData[0].year - b.annualData[0].year
  );

  return sortedData
    .map((dataset, index) => {
      if (index === 0) return null;
      const prevYear = sortedData[index - 1].annualData[0];
      const currentYear = dataset.annualData[0];

      return {
        year: currentYear.year,
        change: currentYear.annual.meanLevel - prevYear.annual.meanLevel,
      };
    })
    .filter(Boolean);
};
