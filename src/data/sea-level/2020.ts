import { SeaLevelDataset } from './types';

export const seaLevel2020: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2020",
    lastUpdated: "2021-12-31",
    version: "1.0.0"
  },
  annualData: [
    {
      year: 2020,
      annual: {
        meanLevel: 73,
        comparedToPrevYear: 0, // 报告中未明确提供
        isHistoricalHigh: false // 为1980年以来第三高
      },
      regional: {
        bohai: {
          comparedToNormal: 86+18*3,
          comparedToPrevYear: 12
        },
        yellowSea: {
          comparedToNormal: 60+18*3,
          comparedToPrevYear: 12
        },
        eastSea: {
          comparedToNormal: 79+18*3,
          comparedToPrevYear: -9
        },
        southSea: {
          comparedToNormal: 68+18*3,
          comparedToPrevYear: -9
        }
      },
      monthlyExtremes: [
        {
          month: 1,
          area: "杭州湾及以北沿海",
          anomaly: 136,
          type: "high"
        },
        {
          month: 6,
          area: "杭州湾及以北沿海",
          anomaly: 107,
          type: "high"
        },
        {
          month: 8,
          area: "台湾海峡沿海",
          type: "low",
          anomaly: 0,
          note: "近20年同期最低"
        },
        {
          month: 10,
          area: "中国沿海",
          anomaly: 170,
          type: "high"
        },
        {
          month: 12,
          area: "福建和广东沿海",
          anomaly: 159,
          type: "high"
        }
      ],
      impacts: [
        {
          type: "stormSurge",
          areas: ["浙江", "广东"],
          severity: "最大",
          details: "风暴潮和滨海城市洪涝主要集中发生在8月"
        },
        {
          type: "erosion",
          areas: ["辽宁", "江苏", "福建", "广西"],
          severity: "加剧",
          details: "与2019年相比，部分监测岸段海岸侵蚀加剧"
        },
        {
          type: "seawaterIntrusion",
          areas: ["辽宁", "河北", "江苏"],
          severity: "加大",
          details: "部分监测区域海水入侵范围加大"
        },
        {
          type: "saltIntrusion",
          areas: ["长江口", "钱塘江口", "珠江口"],
          severity: "变化",
          details: "长江口和钱塘江口咸潮入侵程度总体减轻，珠江口咸潮入侵程度加重"
        }
      ],
      trends: [
        {
          riseRate: 3.4,
          period: {
            start: 1980,
            end: 2020
          }
        }
      ]
    }
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2020,
        riseRate: 3.4
      }
    ]
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 55,
      max: 170
    }
  }
}; 