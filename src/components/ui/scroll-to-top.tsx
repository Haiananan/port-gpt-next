"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // 控制按钮显示/隐藏的函数
  const toggleVisibility = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  };

  // 滚动到顶部的函数
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", toggleVisibility);
      return () => {
        window.removeEventListener("scroll", toggleVisibility);
      };
    }
  }, []);

  // 如果在服务器端，不渲染任何内容
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <>
      {isVisible && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={scrollToTop}
          aria-label="返回顶部"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
