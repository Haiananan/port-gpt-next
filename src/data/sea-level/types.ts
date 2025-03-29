// 定义数据类型
export interface AnnualSeaLevelData {
  year: number;

  annual: {
    meanLevel: number; // 年平均海平面（相对于常年，单位：毫米）
    comparedToPrevYear: number; // 与上年相比（单位：毫米）
    isHistoricalHigh: boolean; // 是否历史最高
  };

  regional: {
    bohai: RegionalData; // 渤海
    yellowSea: RegionalData; // 黄海
    eastSea: RegionalData; // 东海
    southSea: RegionalData; // 南海
  };

  monthlyExtremes: MonthlyExtreme[];
  impacts: DisasterImpact[];
  trends: {
    riseRate: number; // 上升速率（毫米/年）
    period: {
      start: number; // 起始年份
      end: number; // 结束年份
    };
  }[];
}

export interface RegionalData {
  comparedToNormal: number; // 较常年偏差（毫米）
  comparedToPrevYear: number; // 较上年偏差（毫米）
  extremeEvents?: {
    type: string; // 事件类型
    date: string; // 发生日期
    value: number; // 极值
  }[];
}

export interface MonthlyExtreme {
  month: number;
  area: string; // 影响区域
  anomaly: number; // 异常值（毫米）
  type: "high" | "low"; // 极值类型
  note?: string; // 备注
}

export interface DisasterImpact {
  type:
    | "stormSurge"
    | "flooding"
    | "erosion"
    | "saltIntrusion"
    | "seawaterIntrusion";
  areas: string[]; // 影响区域
  severity: string; // 影响程度
  details?: string; // 详细描述
  losses?: {
    economic?: number; // 经济损失（万元）
    other?: string; // 其他损失描述
  };
}

export interface SeaLevelDataset {
  metadata: {
    dataSource: string;
    lastUpdated: string;
    version: string;
    notes?: string[];
  };
  annualData: AnnualSeaLevelData[];
  longTermTrends: {
    periods: {
      start: number;
      end: number;
      riseRate: number; // 上升速率（毫米/年）
      confidence?: number; // 置信度
    }[];
  };
  predictions: {
    period: number; // 预测年限
    riseRange: {
      min: number; // 最小预测值（毫米）
      max: number; // 最大预测值（毫米）
    };
    confidence?: number; // 置信度
  };
  observationCapability?: {
    gnssStations?: {
      startYear: number;
      stationCount: string;
      observations: {
        northOfYangtze: {
          trend: string;
          exceptions?: {
            area: string;
            trend: string;
          }[];
        };
        southOfYangtze: {
          trend: string;
          exceptions?: {
            area: string;
            trend: string;
          }[];
        };
      };
    };
    notes?: string[];
  };
}
