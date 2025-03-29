"use client";

import { seaLevel2011 } from "@/data/sea-level";

export default function YearlyHighlights() {
  const { monthlyExtremes, impacts } = seaLevel2011.annualData[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">月度极值事件</h3>
        <ul className="space-y-4">
          {monthlyExtremes.map((event, index) => (
            <li key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="font-medium">
                {event.month}月 - {event.area}
              </div>
              <div className="text-gray-600">
                较常年{event.anomaly > 0 ? "偏高" : "偏低"}{" "}
                {Math.abs(event.anomaly)}毫米
              </div>
              <div className="text-sm text-gray-500">{event.note}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">主要影响</h3>
        <ul className="space-y-4">
          {impacts.map((impact, index) => (
            <li key={index} className="border-l-4 border-red-500 pl-4">
              <div className="font-medium">{impact.type}</div>
              <div className="text-gray-600">
                影响地区: {impact.areas.join("、")}
              </div>
              <div className="text-sm text-gray-500">{impact.details}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
