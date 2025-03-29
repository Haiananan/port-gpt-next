"use client";

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg backdrop-blur-sm">
      <h4 className="font-medium mb-2">盐度分布</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500/80" />
          <span className="text-sm">高盐度 ({">"}32‰)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500/50" />
          <span className="text-sm">中等盐度 (28-32‰)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500/20" />
          <span className="text-sm">低盐度 ({`<`}28‰)</span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          * 圆点大小表示盐度值
        </div>
      </div>
    </div>
  );
}
