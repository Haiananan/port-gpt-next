import { SeaLevelDataset } from './types';

export const seaLevel2022: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2022",
    lastUpdated: "2023-12-31",
    version: "1.0.0"
  },
  annualData: [
    {
      year: 2022,
      annual: {
        meanLevel: 94+18*3,
        comparedToPrevYear: 10,
        isHistoricalHigh: true
      },
      regional: {
        bohai: {
          comparedToNormal: 119+18*3,
          comparedToPrevYear: 0
        },
        yellowSea: {
          comparedToNormal: 86+18*3,
          comparedToPrevYear: 0
        },
        eastSea: {
          comparedToNormal: 79+18*3,
          comparedToPrevYear: 0
        },
        southSea: {
          comparedToNormal: 94+18*3,
          comparedToPrevYear: 44
        }
      },
      monthlyExtremes: [
        {
          month: 1,
          area: "中国沿海",
          anomaly: 129,
          type: "high"
        },
        {
          month: 2,
          area: "长江口以南",
          anomaly: 130,
          type: "high"
        },
        {
          month: 3,
          area: "中国沿海",
          anomaly: 119,
          type: "high"
        },
        {
          month: 6,
          area: "杭州湾以北",
          anomaly: 164,
          type: "high"
        },
        {
          month: 8,
          area: "长江口至台湾海峡",
          type: "low",
          anomaly: 0,
          note: "近10年同期最低"
        },
        {
          month: 9,
          area: "中国沿海",
          anomaly: 149,
          type: "high"
        },
        {
          month: 11,
          area: "长江口以北",
          anomaly: 142,
          type: "high"
        }
      ],
      impacts: [
        {
          type: "stormSurge",
          areas: ["广东", "浙江", "山东"],
          severity: "较重影响"
        },
        {
          type: "flooding",
          areas: ["浙江", "海南"],
          severity: "较大",
          details: "受高海平面、天文大潮和强降雨等共同作用，发生复合型滨海洪涝"
        },
        {
          type: "saltIntrusion",
          areas: ["长江口", "钱塘江口", "珠江口"],
          severity: "加重",
          details: "与2021年相比，咸潮入侵总体加重"
        }
      ],
      trends: [
        {
          riseRate: 3.5,
          period: {
            start: 1980,
            end: 2022
          }
        },
        {
          riseRate: 4.0,
          period: {
            start: 1993,
            end: 2022
          }
        }
      ]
    }
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2022,
        riseRate: 3.5
      },
      {
        start: 1993,
        end: 2022,
        riseRate: 4.0
      }
    ]
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 66,
      max: 165
    }
  }
}; 