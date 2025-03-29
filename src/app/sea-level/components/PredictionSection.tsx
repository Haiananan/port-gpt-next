"use client";

import { seaLevel2011 } from "@/data/sea-level";

export default function PredictionSection() {
  const { predictions } = seaLevel2011;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">
          未来{predictions.period}年预测
        </h3>
        <p className="text-gray-600">
          预计海平面上升范围: {predictions.riseRange.min}~
          {predictions.riseRange.max}毫米
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium mb-2">低风险预测</h4>
          <p className="text-2xl font-bold text-green-600">
            {predictions.riseRange.min}mm
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium mb-2">中等风险预测</h4>
          <p className="text-2xl font-bold text-yellow-600">
            {Math.round(
              (predictions.riseRange.min + predictions.riseRange.max) / 2
            )}
            mm
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium mb-2">高风险预测</h4>
          <p className="text-2xl font-bold text-red-600">
            {predictions.riseRange.max}mm
          </p>
        </div>
      </div>
    </div>
  );
}
