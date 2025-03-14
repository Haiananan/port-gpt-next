import { NextResponse } from "next/server";

// 生成真实的随机数，带有趋势和周期性
function generateRealisticValues(
  years: number,
  type: string,
  parameter: string
): number[] {
  const values: number[] = [];

  // 基础参数
  let base = 0;
  let trend = 0;
  let amplitude = 0;
  let noise = 0;

  // 根据参数类型设置基础值和变化范围
  switch (parameter) {
    case "waveHeight":
      base = 3.5; // 平均浪高 (m)
      trend = 0.02; // 每年上升趋势 (气候变化影响)
      amplitude = 1.2; // 波动幅度
      noise = 0.8; // 随机变化幅度
      break;
    case "wavePeriod":
      base = 8.0; // 平均周期 (s)
      trend = 0.01;
      amplitude = 0.7;
      noise = 0.5;
      break;
    case "windSpeed":
      base = 15.0; // 平均风速 (m/s)
      trend = 0.03;
      amplitude = 2.5;
      noise = 1.2;
      break;
    case "temperature":
      base = 30.0; // 平均最高气温 (°C)
      trend = 0.04; // 全球变暖趋势
      amplitude = 1.5;
      noise = 0.7;
      break;
    case "pressure":
      base = 980.0; // 台风期间最低气压 (hPa)
      trend = -0.05; // 台风强度增加趋势
      amplitude = 8.0;
      noise = 5.0;
      break;
    default:
      base = 10.0;
      trend = 0.01;
      amplitude = 1.0;
      noise = 0.5;
  }

  // 生成起始年份 (当前年份减去数据年数)
  const startYear = new Date().getFullYear() - years;

  // 添加周期性变化组件 (模拟自然周期如ENSO、太阳活动等)
  const cycle1Period = 7.3; // ~7年周期（如ENSO影响）
  const cycle2Period = 11.2; // ~11年周期（如太阳活动周期）

  // 随机种子值，确保不同参数有不同的随机序列
  const seed =
    parameter.charCodeAt(0) + parameter.charCodeAt(parameter.length - 1);

  // 生成逐年数据
  for (let i = 0; i < years; i++) {
    const year = startYear + i;

    // 添加长期趋势
    let value = base + trend * i;

    // 添加周期性变化
    value += amplitude * 0.5 * Math.sin((2 * Math.PI * i) / cycle1Period);
    value += amplitude * 0.3 * Math.sin((2 * Math.PI * i) / cycle2Period);

    // 添加特定年份的异常值（如厄尔尼诺特强年份）
    if ([5, 12, 19, 26].includes(i)) {
      value += amplitude * (type === "max" ? 1.2 : -1.2);
    }

    // 添加随机变化 (使用伪随机数生成器，种子基于参数名，确保可重复性)
    const randomValue = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const normalizedRandom = randomValue - Math.floor(randomValue);

    value += (normalizedRandom * 2 - 1) * noise;

    // 对于最小值，反转部分效应
    if (type === "min") {
      value = base * 2 - value * 0.8;
    }

    // 确保物理合理性
    if (parameter === "waveHeight" && value < 0.5) value = 0.5;
    if (parameter === "wavePeriod" && value < 3) value = 3;
    if (parameter === "windSpeed" && value < 5) value = 5;
    if (parameter === "temperature" && type === "min" && value > 20) value = 20;

    // 四舍五入到1位小数
    value = Math.round(value * 10) / 10;

    values.push(value);
  }

  return values;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parameter = searchParams.get("parameter") || "waveHeight";
    const type = searchParams.get("type") || "max";
    const years = parseInt(searchParams.get("years") || "30");

    // 验证参数
    if (
      ![
        "waveHeight",
        "wavePeriod",
        "windSpeed",
        "temperature",
        "pressure",
      ].includes(parameter)
    ) {
      return NextResponse.json({ error: "无效的参数类型" }, { status: 400 });
    }

    if (!["max", "min"].includes(type)) {
      return NextResponse.json(
        { error: "类型必须是 'max' 或 'min'" },
        { status: 400 }
      );
    }

    // 限制年数范围
    const validYears = Math.min(Math.max(years, 5), 100);

    // 生成模拟数据
    const values = generateRealisticValues(validYears, type, parameter);

    // 格式化返回数据
    const startYear = new Date().getFullYear() - validYears;
    const result = values.map((value, index) => {
      return {
        year: startYear + index,
        value,
      };
    });

    return NextResponse.json({
      parameter,
      type,
      years: validYears,
      data: result,
    });
  } catch (error) {
    console.error("生成模拟极值数据失败:", error);
    return NextResponse.json({ error: "生成模拟数据失败" }, { status: 500 });
  }
}
