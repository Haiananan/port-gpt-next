import { SeaLevelDataset } from "./types";

export const seaLevel2013: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2013",
    lastUpdated: "2014-03-31",
    version: "1.0.0",
    notes: ["常年基准期为1975-1993年"],
  },
  annualData: [
    {
      year: 2013,
      annual: {
        meanLevel: 95,
        comparedToPrevYear: -27,
        isHistoricalHigh: false, // 为1980年以来第二高
      },
      regional: {
        bohai: {
          comparedToNormal: 107,
          comparedToPrevYear: -3,
        },
        yellowSea: {
          comparedToNormal: 88,
          comparedToPrevYear: -20,
        },
        eastSea: {
          comparedToNormal: 77,
          comparedToPrevYear: -45,
        },
        southSea: {
          comparedToNormal: 114,
          comparedToPrevYear: -22,
        },
      },
      monthlyExtremes: [
        {
          month: 1,
          area: "渤海和黄海北部沿海",
          type: "high",
          anomaly: 180,
          note: "1980年以来同期最高",
        },
        {
          month: 5,
          area: "全海域",
          type: "high",
          anomaly: 155,
          note: "1980年以来同期最高",
        },
        {
          month: 7,
          area: "黄海南部至台湾海峡沿海",
          type: "low",
          anomaly: -28,
          note: "2000年以来同期最低",
        },
        {
          month: 10,
          area: "黄海南部至东海北部沿海",
          type: "high",
          anomaly: 180,
          note: "1980年以来同期最高",
        },
      ],
      impacts: [
        {
          type: "erosion",
          areas: ["辽宁", "山东", "江苏"],
          severity: "严重",
          details: "海岸侵蚀范围加大",
        },
        {
          type: "seawaterIntrusion",
          areas: ["辽宁", "河北", "山东"],
          severity: "严重",
          details: "海水入侵与土壤盐渍化程度增强",
        },
        {
          type: "stormSurge",
          areas: ["浙江", "广东"],
          severity: "加重",
          details: "高海平面加剧了风暴潮和洪涝灾害",
        },
      ],
      trends: [
        {
          riseRate: 2.9,
          period: {
            start: 1980,
            end: 2013,
          },
        },
      ],
    },
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2013,
        riseRate: 2.9,
      },
    ],
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 60,
      max: 165,
    },
  },
};
