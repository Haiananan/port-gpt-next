"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

/**​
 * 计算越浪量（基于《海港水文规范》JTS 145-2015）
 * @param {number} waveHeight - 有效波高H（m）
 * @param {number} slope - 防波堤坡度（tanα，如1:3坡度为0.33）
 * @param {number} crestHeight - 防浪结构顶高与静水位高差Rc（m）
 * @returns {number} 越浪量q（m³/s/m）
 */
const calculateWaveOvertopping = (
  waveHeight: number,
  slope: number,
  crestHeight: number
) => {
  return (
    0.2 * (waveHeight / Math.sqrt(slope)) * Math.exp(-crestHeight / waveHeight)
  );
};

const calculateSafetyMargin = (
  designDepth: number,
  waterLevel: number,
  waveOvertopping: number
) => {
  return designDepth - (waterLevel + waveOvertopping);
};

const calculateNavigationWindow = (
  requiredDepth: number,
  designDepth: number
) => {
  return requiredDepth - designDepth;
};

export default function AnalysisPage() {
  // 输入参数状态
  const [waveParams, setWaveParams] = useState({
    waveHeight: 3.5,
    wavePeriod: 9,
    slope: 0.33,
    crestHeight: 7.0,
  });

  const [waterLevelParams, setWaterLevelParams] = useState({
    currentExtremeLevel: 4.8,
    futureSeaLevelRise: 0.5,
  });

  const [channelParams, setChannelParams] = useState([
    {
      name: "庙岭航道",
      currentDepth: -16.0,
      designDepth: -16.0,
      width: 230,
      length: 2.1,
      scale: "15万吨级",
      note: "满足7万吨级集装箱全潮双向通航，兼顾20万吨级航道基础上拓宽",
    },
    {
      name: "内航道",
      currentDepth: -16.5,
      designDepth: -16.5,
      width: 335,
      length: 4.3,
      scale: "15万吨级",
      note: "满足7万吨级集装箱全潮双向通航，兼顾20万吨级集装箱船兼潮单向通航",
    },
    {
      name: "口门段",
      currentDepth: -15.8,
      designDepth: -23.0,
      width: 375,
      length: 5.2,
      scale: "40万吨级",
      note: "满足7万吨级集装箱全潮双向通航，兼顾40万吨级散货船满载兼潮单向通航（兼潮历时4.5h，90%保证率）",
    },
    {
      name: "外航道外段",
      currentDepth: -22.4,
      designDepth: -22.9,
      width: 345,
      length: 35.6,
      scale: "30万吨级",
      note: "30万吨级油船、散货船兼潮单向通航",
    },
    {
      name: "徐圩航道",
      currentDepth: -22.0,
      designDepth: -22.2,
      width: 350,
      length: 17.6,
      scale: "30万吨级",
      note: "满足30万吨级油船满载兼潮单向通航（兼潮历时4.5h，90%保证率），兼顾5万吨级液体散货船全潮双向通航",
    },
  ]);

  const [shipParams, setShipParams] = useState({
    draft: 23,
    safetyMargin: 1.5,
  });

  // 计算结果
  const currentRc =
    waveParams.crestHeight - waterLevelParams.currentExtremeLevel;
  const futureRc =
    waveParams.crestHeight -
    (waterLevelParams.currentExtremeLevel +
      waterLevelParams.futureSeaLevelRise);

  const currentWaveOvertopping = calculateWaveOvertopping(
    waveParams.waveHeight,
    waveParams.slope,
    currentRc
  );

  const futureWaveOvertopping = calculateWaveOvertopping(
    waveParams.waveHeight,
    waveParams.slope,
    futureRc
  );

  const futureWaterLevel =
    waterLevelParams.currentExtremeLevel + waterLevelParams.futureSeaLevelRise;

  const channelAnalysis = channelParams.map((channel) => {
    const designDepth = channel.designDepth + 1.5; // 转换为黄海高程
    const safetyMargin = calculateSafetyMargin(
      designDepth,
      futureWaterLevel,
      futureWaveOvertopping
    );
    const navigation = {
      requiredDepth: shipParams.draft + shipParams.safetyMargin,
      navigationWindow: calculateNavigationWindow(
        shipParams.draft + shipParams.safetyMargin,
        designDepth
      ),
    };

    return {
      ...channel,
      designDepth,
      safetyMargin,
      navigation,
    };
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            连云港航道淹没风险分析
          </h1>
          <Badge variant="outline" className="text-lg">
            专业分析系统
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                波浪参数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-600">有效波高 (m)</Label>
                  <Input
                    type="number"
                    value={waveParams.waveHeight}
                    onChange={(e) =>
                      setWaveParams({
                        ...waveParams,
                        waveHeight: Number(e.target.value),
                      })
                    }
                    className="focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">波周期 (s)</Label>
                  <Input
                    type="number"
                    value={waveParams.wavePeriod}
                    onChange={(e) =>
                      setWaveParams({
                        ...waveParams,
                        wavePeriod: Number(e.target.value),
                      })
                    }
                    className="focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">防波堤坡度</Label>
                  <Input
                    type="number"
                    value={waveParams.slope}
                    onChange={(e) =>
                      setWaveParams({
                        ...waveParams,
                        slope: Number(e.target.value),
                      })
                    }
                    className="focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">防浪结构顶高 (m)</Label>
                  <Input
                    type="number"
                    value={waveParams.crestHeight}
                    onChange={(e) =>
                      setWaveParams({
                        ...waveParams,
                        crestHeight: Number(e.target.value),
                      })
                    }
                    className="focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                水位参数
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-600">现状极端水位 (m)</Label>
                  <Input
                    type="number"
                    value={waterLevelParams.currentExtremeLevel}
                    onChange={(e) =>
                      setWaterLevelParams({
                        ...waterLevelParams,
                        currentExtremeLevel: Number(e.target.value),
                      })
                    }
                    className="focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600">未来海平面上升 (m)</Label>
                  <Input
                    type="number"
                    value={waterLevelParams.futureSeaLevelRise}
                    onChange={(e) =>
                      setWaterLevelParams({
                        ...waterLevelParams,
                        futureSeaLevelRise: Number(e.target.value),
                      })
                    }
                    className="focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-600" />
              分析结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* 越浪分析 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                1. 越浪分析
              </h3>
              <div className="space-y-4 pl-6">
                <Alert className="bg-gray-50 border-gray-200">
                  <AlertTitle className="text-gray-800">计算公式</AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="bg-gray-100 px-4 py-2 rounded text-gray-800 font-serif">
                      <BlockMath>
                        {`q = 0.2 \\cdot \\frac{H}{\\sqrt{\\tan\\alpha}} \\cdot \\exp\\left(-\\frac{R_c}{H}\\right)`}
                      </BlockMath>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      其中：<InlineMath>{"q"}</InlineMath> 为越浪量，
                      <InlineMath>{"H"}</InlineMath> 为有效波高，
                      <InlineMath>{"\\tan\\alpha"}</InlineMath> 为防波堤坡度，
                      <InlineMath>{"R_c"}</InlineMath>{" "}
                      为防浪结构相对水位高度（结构顶高-水位）
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      说明：当海平面上升导致 <InlineMath>{"R_c"}</InlineMath>{" "}
                      减小时，
                      <InlineMath>{"\\exp(-R_c/H)"}</InlineMath>{" "}
                      值增大，越浪量随之增加。
                      这反映了物理现实：水位越接近防浪堤顶，越浪量越大。
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      参考依据：《海港水文规范》JTS 145-2015
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">现状计算</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        Rc = {waveParams.crestHeight}m -{" "}
                        {waterLevelParams.currentExtremeLevel}m ={" "}
                        <span className="font-semibold text-gray-800">
                          {currentRc.toFixed(2)}m
                        </span>
                      </p>
                      <p className="text-gray-600">
                        越浪量 ={" "}
                        <span className="font-semibold text-gray-800">
                          {currentWaveOvertopping.toFixed(3)} m³/s/m
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">
                      未来计算（2050年）
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        Rc = {waveParams.crestHeight}m - (
                        {waterLevelParams.currentExtremeLevel}m +{" "}
                        {waterLevelParams.futureSeaLevelRise}m) ={" "}
                        <span className="font-semibold text-gray-800">
                          {futureRc.toFixed(2)}m
                        </span>
                      </p>
                      <p className="text-gray-600">
                        越浪量 ={" "}
                        <span className="font-semibold text-gray-800">
                          {futureWaveOvertopping.toFixed(3)} m³/s/m
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTitle className="text-yellow-800">结论</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="text-yellow-800 font-medium">
                      越浪量增加:{" "}
                      {(
                        ((futureWaveOvertopping - currentWaveOvertopping) /
                          currentWaveOvertopping) *
                        100
                      ).toFixed(0)}
                      %
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 航道分析 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                2. 航道分析
              </h3>
              <div className="space-y-4 pl-6">
                <Alert className="bg-gray-50 border-gray-200">
                  <AlertTitle className="text-gray-800">计算公式</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                        设计底高（黄海） = 设计底高（理论最低潮面） + 1.5m
                      </code>
                    </p>
                    <p className="text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                        安全余量 = 设计底高 - (极端水位 + 越浪增水)
                      </code>
                    </p>
                    <p className="text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                        通航窗口 = 要求水深 - 设计水深
                      </code>
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {channelAnalysis.map((channel) => (
                    <Card key={channel.name} className="bg-gray-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-gray-800">
                          {channel.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{channel.scale}</p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-600">设计宽度:</p>
                            <p className="font-medium text-gray-800">
                              {channel.width}m
                            </p>
                            <p className="text-gray-600">航段长度:</p>
                            <p className="font-medium text-gray-800">
                              {channel.length}km
                            </p>
                            <p className="text-gray-600">现状底高:</p>
                            <p className="font-medium text-gray-800">
                              {channel.currentDepth}m
                            </p>
                            <p className="text-gray-600">设计底高:</p>
                            <p className="font-medium text-gray-800">
                              {channel.designDepth}m
                            </p>
                          </div>
                          <Separator className="my-2" />
                          <div className="space-y-2">
                            <p className="text-gray-600">
                              设计底高（黄海）:{" "}
                              <span className="font-semibold text-gray-800">
                                {(channel.designDepth + 1.5).toFixed(1)}m
                              </span>
                            </p>
                            <p className="text-gray-600">
                              安全余量:{" "}
                              <span className="font-semibold text-gray-800">
                                {channel.safetyMargin.toFixed(1)}m
                              </span>
                            </p>
                            <p className="text-gray-600">
                              通航窗口:{" "}
                              <span className="font-semibold text-gray-800">
                                {channel.navigation.navigationWindow.toFixed(1)}
                                m
                              </span>
                              {channel.navigation.navigationWindow <= 0 ? (
                                <Badge
                                  variant="default"
                                  className="ml-2 bg-green-100 text-green-800"
                                >
                                  可通航
                                </Badge>
                              ) : (
                                <Badge
                                  variant="default"
                                  className="ml-2 bg-yellow-100 text-yellow-800"
                                >
                                  需乘潮通航
                                </Badge>
                              )}
                            </p>
                          </div>
                          <Separator className="my-2" />
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              {channel.note}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 风险评估 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                3. 风险评估
              </h3>
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {channelAnalysis.map((channel) => (
                    <Card key={channel.name} className="bg-gray-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-gray-800">
                          {channel.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            安全余量:{" "}
                            <span className="font-semibold text-gray-800">
                              {channel.safetyMargin.toFixed(1)}m
                            </span>
                          </p>
                          <div className="mt-2">
                            {channel.safetyMargin < -25 ? (
                              <Alert className="bg-green-50 border-green-200">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <AlertTitle className="text-green-800">
                                  低风险
                                </AlertTitle>
                                <AlertDescription className="text-green-700">
                                  安全余量充足，通航条件最佳
                                </AlertDescription>
                              </Alert>
                            ) : channel.safetyMargin < -20 ? (
                              <Alert className="bg-gray-50 border-gray-200">
                                <CheckCircle2 className="w-4 h-4 text-gray-600" />
                                <AlertTitle className="text-gray-800">
                                  中低风险
                                </AlertTitle>
                                <AlertDescription className="text-gray-700">
                                  安全余量较好，通航条件良好
                                </AlertDescription>
                              </Alert>
                            ) : channel.safetyMargin < -15 ? (
                              <Alert className="bg-yellow-50 border-yellow-200">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <AlertTitle className="text-yellow-800">
                                  中等风险
                                </AlertTitle>
                                <AlertDescription className="text-yellow-700">
                                  安全余量一般，需注意船舶吃水限制
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Alert className="bg-red-50 border-red-200">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <AlertTitle className="text-red-800">
                                  高风险
                                </AlertTitle>
                                <AlertDescription className="text-red-700">
                                  安全余量不足，存在通航风险
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert className="bg-gray-50 border-gray-200">
                  <AlertTitle className="text-gray-800">建议措施</AlertTitle>
                  <AlertDescription className="mt-2">
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>加强航道疏浚维护</li>
                      <li>优化船舶通航调度</li>
                      <li>完善应急预案</li>
                      <li>考虑航道加深可行性</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
