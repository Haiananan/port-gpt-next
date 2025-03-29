import { SeaLevelDataset } from "./types";

export const seaLevel2011: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2011",
    lastUpdated: "2012-07-31",
    version: "1.0.0",
  },
  annualData: [
    {
      year: 2011,
      annual: {
        meanLevel: 69,
        comparedToPrevYear: 2,
        isHistoricalHigh: false,
      },
      regional: {
        bohai: {
          comparedToNormal: 79,
          comparedToPrevYear: 15,
        },
        yellowSea: {
          comparedToNormal: 65,
          comparedToPrevYear: -10,
        },
        eastSea: {
          comparedToNormal: 56,
          comparedToPrevYear: -10,
        },
        southSea: {
          comparedToNormal: 79,
          comparedToPrevYear: 15,
        },
      },
      monthlyExtremes: [
        {
          month: 1,
          area: "渤黄海沿海",
          type: "low",
          anomaly: -20,
          note: "较常年同期偏低",
        },
        {
          month: 3,
          area: "台湾海峡以北沿海",
          type: "low",
          anomaly: -48,
          note: "较常年同期偏低",
        },
        {
          month: 9,
          area: "珠江口至海南岛东部沿海",
          type: "high",
          anomaly: 200,
          note: "达30年来同期最高",
        },
        {
          month: 11,
          area: "黄海沿海",
          type: "high",
          anomaly: 180,
          note: "达近30年来同期最高",
        },
      ],
      impacts: [
        {
          type: "erosion",
          areas: ["辽宁", "河北", "山东"],
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
          areas: ["福建", "广东", "广西", "海南"],
          severity: "加重",
          details: "高海平面加剧了风暴潮的影响",
        },
      ],
      trends: [
        {
          riseRate: 2.7,
          period: {
            start: 1980,
            end: 2011,
          },
        },
      ],
    },
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2011,
        riseRate: 2.7,
      },
    ],
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 145,
      max: 200,
    },
  },
};
