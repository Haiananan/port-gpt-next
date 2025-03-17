import { Anchor } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, LineChart, Upload } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "数据主页",
    icon: Home,
    description: "查看数据统计和概览",
  },
  {
    href: "/extreme-analysis",
    label: "极值分析",
    icon: LineChart,
    description: "进行极值分布拟合分析",
  },
  {
    href: "/upload",
    label: "数据导入",
    icon: Upload,
    description: "导入海洋站观测数据",
  },
];

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const currentPage = navItems.find((item) => item.href === pathname);

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
      <div className="container flex h-14 items-center px-8">
        <div className="flex items-center space-x-2 pl-4">
          <Anchor className="h-6 w-6" />
          <span className="font-bold text-lg">港航灵眸</span>
          <span className="text-sm text-muted-foreground">
            港口水文数据智能分析平台
          </span>
        </div>
        <div className="ml-4 flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-base"
              >
                {currentPage?.label || "导航"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 py-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="ml-auto">
          <ThemeToggle></ThemeToggle>
        </div>
      </div>
    </header>
  );
}
