import { Anchor } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2 pl-4">
          <Anchor className="h-6 w-6" />
          <span className="font-bold text-lg">港航灵眸</span>
        </div>
      </div>
    </header>
  );
}
