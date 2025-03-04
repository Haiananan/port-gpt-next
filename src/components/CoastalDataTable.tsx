import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATIONS } from "@/config/stations";
import { CoastalStationData } from "@/types/coastal";
import { Copy } from "lucide-react";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { toast } from "sonner";

interface CoastalDataTableProps {
  data: CoastalStationData[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CoastalDataTable({
  data,
  total,
  page,
  totalPages,
  onPageChange,
}: CoastalDataTableProps) {
  const copyRowToClipboard = (row: CoastalStationData) => {
    const text = [
      `站点: ${row.station}`,
      `日期: ${dayjs(row.date).format("YYYY-MM-DD HH:mm:ss")}`,
      `经度: ${row.longitude.toFixed(2)}`,
      `纬度: ${row.latitude.toFixed(2)}`,
      `能见度: ${row.visibility?.toFixed(1) ?? "-"} km`,
      `气温: ${row.airTemperature?.toFixed(1) ?? "-"} ℃`,
      `风向: ${row.windDirection?.toFixed(1) ?? "-"} °`,
      `风速: ${row.windSpeed?.toFixed(1) ?? "-"} m/s`,
      `气压: ${row.airPressure?.toFixed(1) ?? "-"} hPa`,
      `降水量: ${row.precipitation?.toFixed(1) ?? "-"} ml`,
      `海温: ${row.seaTemperature?.toFixed(1) ?? "-"} ℃`,
      `风浪高度: ${row.windWaveHeight?.toFixed(1) ?? "-"} m`,
      `风浪周期: ${row.windWavePeriod?.toFixed(1) ?? "-"} s`,
      `涨潮高度: ${row.surgeHeight?.toFixed(1) ?? "-"} m`,
      `涨潮周期: ${row.surgePeriod?.toFixed(1) ?? "-"} s`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      toast.success("已复制到剪贴板");
    });
  };

  return (
    <Card className="flex flex-col h-[90vh]">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableRow className="hover:bg-muted/50">
                <TableHead className="whitespace-nowrap px-6 py-3">
                  操作
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  站点
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  日期
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  经度
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  纬度
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  能见度(km)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  气温(℃)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  风向(°)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  风速(m/s)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  气压(hPa)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  降水量(ml)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  海温(℃)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  风浪高度(m)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  风浪周期(s)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  涨潮高度(m)
                </TableHead>
                <TableHead className="whitespace-nowrap px-6 py-3">
                  涨潮周期(s)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="text-center h-32">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="px-6 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyRowToClipboard(item)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-3">
                      {item.station}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-3">
                      {dayjs(item.date).format("YYYY-MM-DD HH:mm:ss")}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.longitude.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.latitude.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.visibility?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.airTemperature?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.windDirection?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.windSpeed?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.airPressure?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.precipitation?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.seaTemperature?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.windWaveHeight?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.windWavePeriod?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.surgeHeight?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {item.surgePeriod?.toFixed(1) ?? "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className=" bottom-0 flex items-center justify-between px-6 py-4 border-t bg-background">
            <div className="text-sm text-muted-foreground text-nowrap line-clamp-1  pr-4">
              共 {total} 条记录
            </div>
            <CustomPagination
              page={page}
              total={totalPages}
              onChange={onPageChange}
              showControls
              showEdges
              siblings={1}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
