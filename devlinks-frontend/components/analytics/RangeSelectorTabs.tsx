"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RangeSelectorTabsProps {
  currentDays: number;
}

export function RangeSelectorTabs({ currentDays }: RangeSelectorTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", value);
    router.push(`/dashboard/analytics?${params.toString()}`);
  };

  return (
    <Tabs value={String(currentDays)} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="7">7d</TabsTrigger>
        <TabsTrigger value="30">30d</TabsTrigger>
        <TabsTrigger value="90">90d</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
