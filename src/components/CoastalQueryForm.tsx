import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATIONS } from "@/config/stations";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { zhCN } from "date-fns/locale";
import "./datepicker.css";
import { addMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 注册中文语言包
registerLocale("zh-CN", zhCN);

interface CoastalQueryFormProps {
  station: string;
  startDate?: Date;
  endDate?: Date;
  onStationChange: (value: string) => void;
  onDateRangeChange: (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;
  onReset: () => void;
}

const EXAMPLE_PRESETS = [
  {
    name: "夏季数据示例",
    station: "XCS",
    startDate: new Date(2022, 5, 1), // 6月1日
    endDate: new Date(2022, 7, 31), // 8月31日
  },
  {
    name: "冬季数据示例",
    station: "LYG",
    startDate: new Date(2022, 11, 1), // 12月1日
    endDate: new Date(2023, 1, 28), // 2月28日
  },
  {
    name: "长期趋势示例",
    station: "LHT",
    startDate: new Date(2022, 0, 1), // 1月1日
    endDate: new Date(2022, 11, 31), // 12月31日
  },
  {
    name: "季节转换示例",
    station: "SSN",
    startDate: new Date(2022, 8, 1), // 9月1日
    endDate: new Date(2022, 10, 30), // 11月30日
  },
];

export function CoastalQueryForm({
  station,
  startDate,
  endDate,
  onStationChange,
  onDateRangeChange,
  onReset,
}: CoastalQueryFormProps) {
  const selectedStation = STATIONS.find((s) => s.code === station);

  const handleStartDateChange = (date: Date | null) => {
    onDateRangeChange(date || undefined, endDate);
  };

  const handleEndDateChange = (date: Date | null) => {
    onDateRangeChange(startDate, date || undefined);
  };

  const handleExampleSelect = (preset: (typeof EXAMPLE_PRESETS)[0]) => {
    onStationChange(preset.station);
    onDateRangeChange(preset.startDate, preset.endDate);
  };

  const datePickerClassName =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <Card>
      <CardHeader>
        <CardTitle>海岸站数据查询</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="station">站点</Label>
            <Select value={station} onValueChange={onStationChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择站点" />
              </SelectTrigger>
              <SelectContent>
                {STATIONS.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStation && (
              <p className="text-sm text-muted-foreground">
                经度: {selectedStation.longitude}°E, 纬度:{" "}
                {selectedStation.latitude}°N
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>开始日期</Label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy年MM月dd日"
                locale="zh-CN"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={new Date(2022, 0, 1)}
                maxDate={endDate || new Date(2023, 6, 31)}
                placeholderText="选择开始日期"
                className={datePickerClassName}
                isClearable
              />
            </div>
            <p className="text-xs text-muted-foreground">
              可选范围：2022年1月1日至
              {endDate ? endDate.toLocaleDateString("zh-CN") : "2023年7月31日"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>结束日期</Label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy年MM月dd日"
                locale="zh-CN"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={startDate || new Date(2022, 0, 1)}
                maxDate={new Date(2023, 6, 31)}
                placeholderText="选择结束日期"
                className={datePickerClassName}
                isClearable
              />
            </div>
            <p className="text-xs text-muted-foreground">
              可选范围：
              {startDate
                ? startDate.toLocaleDateString("zh-CN")
                : "2022年1月1日"}
              至2023年7月31日
            </p>
          </div>
          <div className="space-y-2 flex flex-col justify-end gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">
                  选择数据示例
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>选择预设数据示例</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                  {EXAMPLE_PRESETS.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-4"
                      onClick={() => {
                        handleExampleSelect(preset);
                      }}
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          站点:{" "}
                          {
                            STATIONS.find((s) => s.code === preset.station)
                              ?.name
                          }{" "}
                          ({preset.station})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          时间: {preset.startDate.toLocaleDateString("zh-CN")} -{" "}
                          {preset.endDate.toLocaleDateString("zh-CN")}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="w-full" onClick={onReset}>
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
