"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface SalinityData {
  stationCode: string;
  stationName: string;
  date: string;
  salinity: number;
  temp08: number;
  temp14: number;
  temp20: number;
}

export default function DataTable() {
  const [station, setStation] = useState<string>();
  const [date, setDate] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      const res = await fetch("/api/salinity/stations");
      return res.json();
    },
  });

  const { data: salinityData, isLoading } = useQuery({
    queryKey: ["salinity-data", station, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (station) params.append("station", station);
      if (date?.from) params.append("start", format(date.from, "yyyy-MM-dd"));
      if (date?.to) params.append("end", format(date.to, "yyyy-MM-dd"));

      const res = await fetch(`/api/salinity/data?${params}`);
      return res.json();
    },
  });

  const filteredData = salinityData?.filter((item: SalinityData) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const downloadCsv = () => {
    if (!filteredData) return;

    const headers = [
      "站点代码",
      "站点名称",
      "日期",
      "盐度(‰)",
      "8时温度(°C)",
      "14时温度(°C)",
      "20时温度(°C)",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map((row: SalinityData) =>
        [
          row.stationCode,
          row.stationName,
          format(new Date(row.date), "yyyy-MM-dd"),
          row.salinity,
          row.temp08,
          row.temp14,
          row.temp20,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `salinity_data_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={station} onValueChange={setStation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择站点" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部站点</SelectItem>
            {stations?.map((s: any) => (
              <SelectItem key={s.stationCode} value={s.stationCode}>
                {s.stationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePickerWithRange date={date} onSelect={setDate} />

        <Input
          placeholder="搜索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-[200px]"
        />

        <Button variant="outline" onClick={downloadCsv}>
          <Download className="w-4 h-4 mr-2" />
          导出CSV
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>站点</TableHead>
              <TableHead>日期</TableHead>
              <TableHead className="text-right">盐度(‰)</TableHead>
              <TableHead className="text-right">8时温度(°C)</TableHead>
              <TableHead className="text-right">14时温度(°C)</TableHead>
              <TableHead className="text-right">20时温度(°C)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.map((row: SalinityData) => (
              <TableRow key={`${row.stationCode}-${row.date}`}>
                <TableCell>{row.stationName}</TableCell>
                <TableCell>
                  {format(new Date(row.date), "yyyy-MM-dd")}
                </TableCell>
                <TableCell className="text-right">
                  {row.salinity.toFixed(3)}
                </TableCell>
                <TableCell className="text-right">
                  {row.temp08.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  {row.temp14.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  {row.temp20.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
