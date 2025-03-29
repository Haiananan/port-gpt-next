"use client";

import TrendChart from "./components/TrendChart";
import RegionalComparison from "./components/RegionalComparison";
import YearlyHighlights from "./components/YearlyHighlights";
import PredictionSection from "./components/PredictionSection";

export default function SeaLevelAnalysis() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">中国海平面变化分析</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">长期趋势分析</h2>
        <TrendChart />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">区域海平面对比</h2>
        <RegionalComparison />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">年度重要事件</h2>
        <YearlyHighlights />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">未来预测</h2>
        <PredictionSection />
      </section>
    </div>
  );
}
