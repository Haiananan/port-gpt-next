import { SeaLevelDataset } from "./types";

export const seaLevel2018: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2018",
    lastUpdated: "2019-12-31",
    version: "1.0.0",
  },
  annualData: [
    {
      year: 2018,
      annual: {
        meanLevel: 48,
        comparedToPrevYear: -1, // 报告提到"比2017年略低"
        isHistoricalHigh: false, // 为1980年以来第六高
      },
      regional: {
        bohai: {
          comparedToNormal: 55,
          comparedToPrevYear: 1, // "略有上升"
        },
        yellowSea: {
          comparedToNormal: 28,
          comparedToPrevYear: 1, // "略有上升"
        },
        eastSea: {
          comparedToNormal: 50,
          comparedToPrevYear: -16,
        },
        southSea: {
          comparedToNormal: 56,
          comparedToPrevYear: -44,
        },
      },
      monthlyExtremes: [
        {
          month: 2,
          area: "山东半岛至台湾海峡以北沿海",
          type: "low",
          anomaly: 0,
          note: "近十年同期最低",
        },
        {
          month: 6,
          area: "珠江口沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
        {
          month: 7,
          area: "中国沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
        {
          month: 8,
          area: "渤海沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
        {
          month: 10,
          area: "长江口以北沿海",
          type: "low",
          anomaly: 0,
          note: "近十年同期最低",
        },
        {
          month: 12,
          area: "江苏至福建沿海",
          type: "high",
          anomaly: 0,
          note: "1980年以来同期最高",
        },
      ],
      impacts: [
        {
          type: "stormSurge",
          areas: ["山东", "浙江", "福建", "广东"],
          severity: "加剧",
          details: "高海平面和天文大潮加剧了风暴潮和洪涝灾害影响程度",
        },
        {
          type: "saltIntrusion",
          areas: ["钱塘江口", "珠江口"],
          severity: "加重",
          details:
            "钱塘江口咸潮最大氯度值升高，珠江口咸潮入侵次数和持续时间均增加",
        },
        {
          type: "erosion",
          areas: ["辽宁", "河北", "山东", "江苏", "福建", "广东"],
          severity: "加剧",
          details: "部分监测岸段海岸侵蚀距离加大",
        },
        {
          type: "seawaterIntrusion",
          areas: ["河北唐山"],
          severity: "加重",
          details: "海水入侵程度加重",
        },
      ],
      trends: [
        {
          riseRate: 3.3,
          period: {
            start: 1980,
            end: 2018,
          },
        },
      ],
    },
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2018,
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
