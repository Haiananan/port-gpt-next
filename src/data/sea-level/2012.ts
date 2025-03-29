import { SeaLevelDataset } from "./types";

export const seaLevel2012: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2012",
    lastUpdated: "2013-02-28",
    version: "1.0.0",
  },
  annualData: [
    {
      year: 2012,
      annual: {
        meanLevel: 122,
        comparedToPrevYear: 53,
        isHistoricalHigh: true, // 为1980年以来最高
      },
      regional: {
        bohai: {
          comparedToNormal: 110,
          comparedToPrevYear: 31,
        },
        yellowSea: {
          comparedToNormal: 108,
          comparedToPrevYear: 43,
        },
        eastSea: {
          comparedToNormal: 122,
          comparedToPrevYear: 66,
        },
        southSea: {
          comparedToNormal: 136,
          comparedToPrevYear: 56,
        },
      },
      monthlyExtremes: [
        {
          month: 5,
          area: "全海域",
          type: "high",
          anomaly: 136,
          note: "1980年以来同期最高",
        },
        {
          month: 6,
          area: "全海域",
          type: "high",
          anomaly: 154,
          note: "1980年以来同期最高",
        },
        {
          month: 8,
          area: "全海域",
          type: "high",
          anomaly: 159,
          note: "1980年以来同期最高",
        },
        {
          month: 10,
          area: "全海域",
          type: "high",
          anomaly: 131,
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
          areas: ["河北", "山东", "江苏"],
          severity: "严重",
          details: "海水入侵与土壤盐渍化程度增强",
        },
        {
          type: "stormSurge",
          areas: ["江苏", "浙江", "广东"],
          severity: "加重",
          details: "高海平面加剧了风暴潮的影响",
        },
      ],
      trends: [
        {
          riseRate: 2.9,
          period: {
            start: 1980,
            end: 2012,
          },
        },
      ],
    },
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2012,
        riseRate: 2.9,
      },
    ],
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 60,
      max: 155, // 取各区域预测的最大值
    },
  },
};
