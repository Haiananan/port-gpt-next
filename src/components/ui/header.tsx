import { Anchor } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // 向下滚动超过20px时隐藏，向上滚动时显示
      if (currentScrollY > lastScrollY && currentScrollY > 20) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // 添加滚动事件监听器
    window.addEventListener("scroll", controlHeader);

    // 清理函数
    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex h-14 items-center px-8">
        <div className="flex items-center space-x-2 pl-4">
          <Anchor className="h-6 w-6" />
          <span className="font-bold text-lg">港航灵眸</span>
          <span className="text-sm text-muted-foreground">
            港口船舶数据分析平台
          </span>
        </div>
        <div className="ml-auto">
          <ThemeToggle></ThemeToggle>
        </div>
      </div>
    </header>
  );
}
