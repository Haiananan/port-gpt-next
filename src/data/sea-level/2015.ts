import { SeaLevelDataset } from "./types";

export const seaLevel2015: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2015",
    lastUpdated: "2016-12-31",
    version: "1.0.0",
    notes: ["常年基准期为1975-1993年，与其他年份（1993-2011年）不同"],
  },
  annualData: [
    {
      year: 2015,
      annual: {
        meanLevel: 90,
        comparedToPrevYear: -21, // 较2014年低21毫米
        isHistoricalHigh: false, // 为1980年以来第四高
      },
      regional: {
        bohai: {
          comparedToNormal: 94,
          comparedToPrevYear: -26,
        },
        yellowSea: {
          comparedToNormal: 91,
          comparedToPrevYear: -19,
        },
        eastSea: {
          comparedToNormal: 96,
          comparedToPrevYear: -19,
        },
        southSea: {
          comparedToNormal: 82,
          comparedToPrevYear: -22,
        },
      },
      monthlyExtremes: [
        {
          month: 6,
          area: "东海南部至雷州半岛沿海",
          type: "low",
          anomaly: -154,
          note: "较2014年同期明显偏低",
        },
        {
          month: 7,
          area: "长江口至台湾海峡以北沿海",
          type: "high",
          anomaly: 218,
          note: "1980年以来同期最高",
        },
        {
          month: 10,
          area: "东海南部沿海",
          type: "low",
          anomaly: -191,
          note: "较2014年同期明显偏低",
        },
        {
          month: 11,
          area: "黄海至杭州湾沿海",
          type: "high",
          anomaly: 192,
          note: "1980年以来同期最高",
        },
      ],
      impacts: [
        {
          type: "erosion",
          areas: ["河北", "江苏", "海南"],
          severity: "加大",
          details: "海岸侵蚀范围加大",
        },
        {
          type: "seawaterIntrusion",
          areas: ["辽宁", "河北", "山东"],
          severity: "严重",
          details: "海水入侵与土壤盐渍化严重",
        },
        {
          type: "stormSurge",
          areas: ["浙江", "福建", "广东"],
          severity: "加剧",
          details: "高海平面加剧了风暴潮灾害",
        },
      ],
      trends: [
        {
          riseRate: 3.0,
          period: {
            start: 1980,
            end: 2015,
          },
        },
      ],
    },
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2015,
        riseRate: 3.0,
      },
      {
        start: 2006,
        end: 2015,
        riseRate: 0,
      },
    ],
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 68,
      max: 165,
    },
  },
};
