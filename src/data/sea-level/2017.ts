import { SeaLevelDataset } from "./types";

export const seaLevel2017: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2017",
    lastUpdated: "2018-12-31",
    version: "1.0.0",
  },
  annualData: [
    {
      year: 2017,
      annual: {
        meanLevel: 58,
        comparedToPrevYear: -24, // 比2016年低24毫米
        isHistoricalHigh: false, // 为1980年以来第四高
      },
      regional: {
        bohai: {
          comparedToNormal: 42,
          comparedToPrevYear: -32,
        },
        yellowSea: {
          comparedToNormal: 23,
          comparedToPrevYear: -43,
        },
        eastSea: {
          comparedToNormal: 66,
          comparedToPrevYear: -49,
        },
        southSea: {
          comparedToNormal: 100,
          comparedToPrevYear: 28,
        },
      },
      monthlyExtremes: [
        {
          month: 1,
          area: "全海域沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
        {
          month: 2,
          area: "台湾海峡以南沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
        {
          month: 3,
          area: "全海域沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
        {
          month: 5,
          area: "台湾海峡及以北沿海",
          type: "low",
          anomaly: 0,
          note: "2001年以来同期最低",
        },
        {
          month: 10,
          area: "全海域沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
      ],
      impacts: [
        {
          type: "erosion",
          areas: ["辽宁", "河北", "山东", "海南"],
          severity: "加大",
          details: "海岸侵蚀范围加大",
        },
        {
          type: "seawaterIntrusion",
          areas: ["辽宁", "河北", "山东"],
          severity: "较重",
          details: "海水入侵较重",
        },
        {
          type: "stormSurge",
          areas: ["浙江", "广东"],
          severity: "加剧",
          details: "高海平面加剧了风暴潮、洪涝与咸潮灾害",
        },
      ],
      trends: [
        {
          riseRate: 3.3,
          period: {
            start: 1980,
            end: 2017,
          },
        },
      ],
    },
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2017,
        riseRate: 3.3,
      },
    ],
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 68,
      max: 166,
    },
  },
};
