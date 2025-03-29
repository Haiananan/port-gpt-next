import { SeaLevelDataset } from "./types";

export const seaLevel2014: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2014",
    lastUpdated: "2015-02-28",
    version: "1.0.0",
    notes: ["常年基准期为1975-1993年，与其他年份（1993-2011年）不同"],
  },
  annualData: [
    {
      year: 2014,
      annual: {
        meanLevel: 111,
        comparedToPrevYear: 16,
        isHistoricalHigh: false, // 为1980年以来第二高
      },
      regional: {
        bohai: {
          comparedToNormal: 120,
          comparedToPrevYear: 13,
        },
        yellowSea: {
          comparedToNormal: 110,
          comparedToPrevYear: 22,
        },
        eastSea: {
          comparedToNormal: 115,
          comparedToPrevYear: 38,
        },
        southSea: {
          comparedToNormal: 104,
          comparedToPrevYear: -10,
        },
      },
      monthlyExtremes: [
        {
          month: 2,
          area: "渤海至东海北部沿海",
          type: "high",
          anomaly: 225,
          note: "1980年以来同期最高",
        },
        {
          month: 3,
          area: "渤海至北黄海沿海",
          type: "high",
          anomaly: 159,
          note: "1980年以来同期最高",
        },
        {
          month: 4,
          area: "渤海至东海北部沿海",
          type: "high",
          anomaly: 128,
          note: "1980年以来同期最高",
        },
        {
          month: 10,
          area: "渤海至东海北部沿海",
          type: "high",
          anomaly: 186,
          note: "1980年以来同期最高",
        },
      ],
      impacts: [
        {
          type: "stormSurge",
          areas: ["海南", "广东", "广西", "浙江"],
          severity: "严重",
          details:
            "9月，台风'海鸥'和'凤凰'登陆期间恰逢天文大潮，加剧了风暴潮灾害",
          losses: {
            economic: 470000, // 47亿元
          },
        },
        {
          type: "erosion",
          areas: ["河北", "江苏", "海南"],
          severity: "加大",
          details: "海岸侵蚀范围加大",
        },
        {
          type: "seawaterIntrusion",
          areas: ["辽宁", "河北", "山东"],
          severity: "增强",
          details: "海水入侵与土壤盐渍化程度增强",
        },
        {
          type: "saltIntrusion",
          areas: ["长江口", "珠江口"],
          severity: "加剧",
          details: "咸潮灾害加剧",
        },
      ],
      trends: [
        {
          riseRate: 3.0,
          period: {
            start: 1980,
            end: 2014,
          },
        },
      ],
    },
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2014,
        riseRate: 3.0,
      },
    ],
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 68,
      max: 165, // 取各区域预测的最大值
    },
  },
};
