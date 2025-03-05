import { Anchor } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-14 items-center px-8">
        <div className="flex items-center space-x-2 pl-4">
          <Anchor className="h-6 w-6" />
          <span className="font-bold text-lg">港航灵眸</span>
          <span className="text-sm text-muted-foreground">
            港口船舶数据分析平台
          </span>
        </div>
        <div className=" ml-auto">
          <ThemeToggle></ThemeToggle>
        </div>
      </div>
    </header>
  );
}
