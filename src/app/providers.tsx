"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { Header } from "@/components/ui/header";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <Header></Header>
      {children}
      <ToasterProvider />
    </QueryClientProvider>
  );
}
