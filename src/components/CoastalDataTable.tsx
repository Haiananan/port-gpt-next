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
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">站点</TableHead>
                <TableHead className="whitespace-nowrap">日期</TableHead>
                <TableHead className="whitespace-nowrap">经度</TableHead>
                <TableHead className="whitespace-nowrap">纬度</TableHead>
                <TableHead className="whitespace-nowrap">能见度(km)</TableHead>
                <TableHead className="whitespace-nowrap">气温(℃)</TableHead>
                <TableHead className="whitespace-nowrap">风向(°)</TableHead>
                <TableHead className="whitespace-nowrap">风速(m/s)</TableHead>
                <TableHead className="whitespace-nowrap">气压(hPa)</TableHead>
                <TableHead className="whitespace-nowrap">降水量(ml)</TableHead>
                <TableHead className="whitespace-nowrap">海温(℃)</TableHead>
                <TableHead className="whitespace-nowrap">风浪高度(m)</TableHead>
                <TableHead className="whitespace-nowrap">风浪周期(s)</TableHead>
                <TableHead className="whitespace-nowrap">涨潮高度(m)</TableHead>
                <TableHead className="whitespace-nowrap">涨潮周期(s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {STATIONS.find((s) => s.code === item.station)?.name ??
                        item.station}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {dayjs(item.date).format("YYYY-MM-DD HH:mm:ss")}
                    </TableCell>
                    <TableCell>{item.longitude.toFixed(2)}</TableCell>
                    <TableCell>{item.latitude.toFixed(2)}</TableCell>
                    <TableCell>{item.visibility?.toFixed(1) ?? "-"}</TableCell>
                    <TableCell>
                      {item.airTemperature?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell>
                      {item.windDirection?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell>{item.windSpeed?.toFixed(1) ?? "-"}</TableCell>
                    <TableCell>{item.airPressure?.toFixed(1) ?? "-"}</TableCell>
                    <TableCell>
                      {item.precipitation?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell>
                      {item.seaTemperature?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell>
                      {item.windWaveHeight?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell>
                      {item.windWavePeriod?.toFixed(1) ?? "-"}
                    </TableCell>
                    <TableCell>{item.surgeHeight?.toFixed(1) ?? "-"}</TableCell>
                    <TableCell>{item.surgePeriod?.toFixed(1) ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              共 {total} 条记录
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                上一页
              </Button>
              <div className="text-sm">
                第 {page} 页，共 {totalPages} 页
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
