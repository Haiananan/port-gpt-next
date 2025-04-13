import { SeaLevelDataset } from './types';

export const seaLevel2019: SeaLevelDataset = {
  metadata: {
    dataSource: "中国海平面公报2019",
    lastUpdated: "2020-12-31",
    version: "1.0.0"
  },
  annualData: [
    {
      year: 2019,
      annual: {
        meanLevel: 72,
        comparedToPrevYear: 0, // 报告中未明确提供
        isHistoricalHigh: false // 为1980年以来第三高
      },
      regional: {
        bohai: {
          comparedToNormal: 74+18*3,
          comparedToPrevYear: 0  // 报告提到"均上升"但未给具体数值
        },
        yellowSea: {
          comparedToNormal: 48+18*3,
          comparedToPrevYear: 0
        },
        eastSea: {
          comparedToNormal: 88+18*3,
          comparedToPrevYear: 38  // 东海升幅最大
        },
        southSea: {
          comparedToNormal: 77+18*3,
          comparedToPrevYear: 0
        }
      },
      monthlyExtremes: [
        {
          month: 1,
          area: "中国沿海",
          anomaly: 0,  // 具体数值未提供
          type: "high",
          note: "1980年以来同期第三高"
        },
        {
          month: 2,
          area: "长江口以南沿海",
          anomaly: 0,
          type: "high",
          note: "1980年以来同期第三高"
        },
        {
          month: 3,
          area: "台湾海峡以南沿海",
          anomaly: 0,
          type: "high",
          note: "1980年以来同期第三高"
        },
        {
          month: 4,
          area: "长江口以南沿海",
          anomaly: 0,
          type: "high",
          note: "1980年以来同期第二高"
        },
        {
          month: 5,
          area: "长江口以南沿海",
          anomaly: 0,
          type: "high",
          note: "1980年以来同期最高"
        },
        {
          month: 7,
          area: "长江口至台湾海峡以北沿海",
          anomaly: 0,
          type: "high",
          note: "1980年以来同期第三高"
        }
      ],
      impacts: [
        {
          type: "stormSurge",
          areas: ["浙江"],
          severity: "最大",
          details: "海平面偏高加剧了风暴潮和滨海城市洪涝的影响程度"
        },
        {
          type: "erosion",
          areas: ["河北", "广西", "海南"],
          severity: "加剧",
          details: "部分岸段海岸侵蚀加剧"
        },
        {
          type: "seawaterIntrusion",
          areas: ["辽宁"],
          severity: "加大",
          details: "局部地区重度海水入侵范围加大"
        },
        {
          type: "saltIntrusion",
          areas: ["长江口", "钱塘江口", "珠江口"],
          severity: "加重",
          details: "咸潮入侵总体加重"
        }
      ],
      trends: [
        {
          riseRate: 3.4,
          period: {
            start: 1980,
            end: 2019
          }
        }
      ]
    }
  ],
  longTermTrends: {
    periods: [
      {
        start: 1980,
        end: 2019,
        riseRate: 3.4
      }
    ]
  },
  predictions: {
    period: 30,
    riseRange: {
      min: 51,
      max: 179
    }
  },
  // 新增观测能力相关信息
  observationCapability: {
    gnssStations: {
      startYear: 2009,
      stationCount: "50余个",
      observations: {
        northOfYangtze: {
          trend: "上升",
          exceptions: [{
            area: "天津沿海",
            trend: "下降明显"
          }]
        },
        southOfYangtze: {
          trend: "下降",
          exceptions: [{
            area: "广西",
            trend: "略有上升"
          }, {
            area: "海南岛东部",
            trend: "略有上升"
          }, {
            area: "海南岛西部",
            trend: "略有上升"
          }]
        }
      }
    },
    notes: [
      "观测站点逐渐增多，布局日趋合理",
      "观测手段更加丰富",
      "业务化开展基准潮位核定工作",
      "形成长期、连续、稳定的高质量海平面数据序列"
    ]
  }
}; 