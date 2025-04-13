import { SeaLevelDataset } from './types';

export const seaLevel2021: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2021",
    lastUpdated: "2022-12-31",
    version: "1.0.0"
  },
  annualData: [
    {
      year: 2021,
      annual: {
        meanLevel: 84+18*3,
        comparedToPrevYear: 0, // 报告中未明确提供
        isHistoricalHigh: true
      },
      regional: {
        bohai: {
          comparedToNormal: 118+18*3,
          comparedToPrevYear: 32
        },
        yellowSea: {
          comparedToNormal: 88+18*3,
          comparedToPrevYear: 28
        },
        eastSea: {
          comparedToNormal: 80+18*3,
          comparedToPrevYear: 0
        },
        southSea: {
          comparedToNormal: 50+18*3,
          comparedToPrevYear: -18
        }
      },
      monthlyExtremes: [
        {
          month: 4,
          area: "中国沿海",
          anomaly: 118,
          type: "high"
        },
        {
          month: 6,
          area: "台湾海峡以北沿海",
          anomaly: 112,
          type: "high"
        },
        {
          month: 7,
          area: "中国沿海",
          anomaly: 133,
          type: "high"
        },
        {
          month: 9,
          area: "长江以北沿海",
          anomaly: 172,
          type: "high"
        },
        {
          month: 9,
          area: "台湾海峡至广东东部沿海",
          type: "low",
          anomaly: 0,
          note: "近35年同期最低"
        }
      ],
      impacts: [
        {
          type: "stormSurge",
          areas: ["浙江", "辽宁", "海南"],
          severity: "较重影响",
          details: "风暴潮和滨海城市洪涝主要发生在季节海平面较高的7－10月"
        },
        {
          type: "erosion",
          areas: ["辽宁", "河北", "福建", "海南"],
          severity: "加剧",
          details: "与2020年相比，部分监测岸段海岸侵蚀加剧"
        },
        {
          type: "seawaterIntrusion",
          areas: ["辽宁", "河北", "江苏"],
          severity: "加大",
          details: "局部地区海水入侵范围加大"
        },
        {
          type: "saltIntrusion",
          areas: ["长江口", "钱塘江口", "珠江口"],
          severity: "加重",
          details: "长江口和钱塘江口咸潮入侵程度总体加重，珠江口咸潮入侵次数和影响天数增加"
        }
      ],
      trends: [
        {
          riseRate: 3.4,
          period: {
            start: 1980,
            end: 2021
          }
        }
      ]
    }
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2021,
        riseRate: 3.4
      }
    ]
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 68,
      max: 170
    }
  }
}; 