"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { read, utils, writeFile } from "xlsx/xlsx.mjs";
import dayjs from "dayjs";
import { Header } from "@/components/ui/header";

interface PreviewData {
  fileName: string;
  rowCount: number;
  data: any[];
}

export default function UploadPage() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateData, setDuplicateData] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [preview, setPreview] = useState<PreviewData[]>([]);

  // 下载示例文件
  const downloadExample = () => {
    const exampleData = [
      {
        station: "站点A",
        date: "2024-03-20",
        latitude: 39.9,
        longitude: 116.4,
        visibility: 10.5,
        airTemperature: 25.6,
        windDirection: 180,
        windSpeed: 5.2,
        airPressure: 1013.2,
        precipitation: 0,
        seaTemperature: 22.3,
        windWaveHeight: 1.5,
        windWavePeriod: 6,
        surgeHeight: 0.8,
        surgePeriod: 12,
        waterLevel: 2.5,
        currentSpeed: 0.5,
        currentDirection: 90,
      },
      {
        station: "站点B",
        date: "2024/03/20",
        latitude: 31.22,
        longitude: 121.48,
        visibility: 9,
        airTemperature: null,
        windDirection: null,
        windSpeed: null,
        airPressure: null,
        precipitation: null,
        seaTemperature: null,
        windWaveHeight: null,
        windWavePeriod: null,
        surgeHeight: null,
        surgePeriod: null,
        waterLevel: null,
        currentSpeed: null,
        currentDirection: null,
      },
    ];

    const ws = utils.json_to_sheet(exampleData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "数据");

    // 触发下载
    writeFile(wb, "海洋站数据导入模板.xlsx");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setSelectedFiles(files);

    if (!files?.length) return;

    const previewData: PreviewData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`开始读取文件: ${file.name}`);

      try {
        const data = await readFileAsString(file);
        const workbook = read(data as string, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = utils.sheet_to_json(worksheet);

        console.log(`文件 ${file.name} 包含 ${json.length} 条数据`);
        console.log("数据示例:", json.slice(0, 2));

        previewData.push({
          fileName: file.name,
          rowCount: json.length,
          data: json.slice(0, 5), // 只预览前5条
        });
      } catch (error) {
        console.error(`读取文件 ${file.name} 失败:`, error);
        toast.error(`读取文件失败: ${file.name}`, {
          description: "请确保文件格式正确",
        });
      }
    }

    setPreview(previewData);
  };

  const readFileAsString = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFiles?.length) {
      toast.error("请选择文件", {
        description: "请先选择要上传的 Excel 文件",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(
          `开始处理文件 ${i + 1}/${selectedFiles.length}: ${file.name}`
        );

        try {
          const data = await readFileAsString(file);
          console.log(`文件 ${file.name} 读取完成`);

          const workbook = read(data as string, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = utils.sheet_to_json(worksheet);

          console.log(`文件 ${file.name} 解析完成，开始处理数据`);

          // 这里需要处理数据验证和转换
          const processedData = json.map((row: any) => {
            // 处理Excel日期
            let dateValue = row.date;
            if (typeof dateValue === "number") {
              // Excel序列号转换为JavaScript日期
              const excelEpoch = new Date(1899, 11, 30);
              const millisecondsPerDay = 24 * 60 * 60 * 1000;
              const dateObj = new Date(
                excelEpoch.getTime() + (dateValue - 1) * millisecondsPerDay
              );
              dateValue = dayjs(dateObj).format("YYYY-MM-DD HH:mm:ss");
            } else if (typeof dateValue === "string") {
              // 字符串日期格式化
              dateValue = dayjs(dateValue).format("YYYY-MM-DD HH:mm:ss");
            }

            // 修正经度字段名
            const longitude = row.longitude || row.longtitude;

            return {
              station: row.station,
              date: new Date(dateValue),
              latitude: parseFloat(row.latitude),
              longitude: parseFloat(longitude),
              visibility: row.visibility ? parseFloat(row.visibility) : null,
              airTemperature: row.airTemperature
                ? parseFloat(row.airTemperature)
                : null,
              windDirection: row.windDirection
                ? parseFloat(row.windDirection)
                : null,
              windSpeed: row.windSpeed ? parseFloat(row.windSpeed) : null,
              airPressure: row.airPressure ? parseFloat(row.airPressure) : null,
              precipitation: row.precipitation
                ? parseFloat(row.precipitation)
                : null,
              seaTemperature: row.seaTemperature
                ? parseFloat(row.seaTemperature)
                : null,
              windWaveHeight: row.windWaveHeight
                ? parseFloat(row.windWaveHeight)
                : null,
              windWavePeriod: row.windWavePeriod
                ? parseFloat(row.windWavePeriod)
                : null,
              surgeHeight: row.surgeHeight ? parseFloat(row.surgeHeight) : null,
              surgePeriod: row.surgePeriod ? parseFloat(row.surgePeriod) : null,
              waterLevel: row.waterLevel ? parseFloat(row.waterLevel) : null,
              currentSpeed: row.currentSpeed
                ? parseFloat(row.currentSpeed)
                : null,
              currentDirection: row.currentDirection
                ? parseFloat(row.currentDirection)
                : null,
            };
          });

          console.log(`文件 ${file.name} 数据处理完成，开始检查重复`);

          // 检查重复数据
          const response = await fetch("/api/check-duplicates", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(processedData),
          });

          const { duplicates } = await response.json();
          console.log(`文件 ${file.name} 发现 ${duplicates.length} 条重复数据`);

          if (duplicates.length > 0) {
            setDuplicateData(duplicates);
            setShowDuplicateDialog(true);
          } else {
            await uploadData(processedData);
          }
        } catch (error) {
          console.error(`处理文件 ${file.name} 时出错:`, error);
          throw error;
        }

        setProgress(((i + 1) / selectedFiles.length) * 100);
      }
    } catch (error) {
      console.error("上传过程出错:", error);
      toast.error("上传失败", {
        description: "处理文件时发生错误",
      });
    } finally {
      setIsUploading(false);
      setSelectedFiles(null);
      setPreview([]);
    }
  };

  const uploadData = async (data: any[], overwrite = false) => {
    try {
      console.log(
        `开始上传数据，${overwrite ? "覆盖模式" : "新增模式"}，数据量: ${
          data.length
        }`
      );

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, overwrite }),
      });

      if (response.ok) {
        console.log("数据上传成功");
        toast.success("上传成功", {
          description: "数据已成功导入",
        });
      }
    } catch (error) {
      console.error("上传数据时出错:", error);
      toast.error("上传失败", {
        description: "导入数据时发生错误",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      {/* <Header></Header> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧上传部分 */}
        <Card>
          <CardHeader>
            <CardTitle>数据导入</CardTitle>
            <CardDescription>
              支持上传 Excel 文件导入站点数据，可以同时选择多个文件。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  首次使用请先下载模板文件。
                </div>
                <Button variant="outline" onClick={downloadExample}>
                  下载模板
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    multiple
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <div className="flex items-center gap-4 flex-col">
                    {selectedFiles?.length ? (
                      <div className="text-sm text-muted-foreground">
                        已选择 {selectedFiles.length} 个文件
                      </div>
                    ) : null}
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || !selectedFiles?.length}
                      className="w-full"
                    >
                      {isUploading ? "正在上传..." : "开始上传"}
                    </Button>
                  </div>
                  {isUploading && (
                    <Progress value={progress} className="w-full" />
                  )}
                </div>

                {/* 文件预览 */}
                {preview.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">文件预览：</h3>
                    {preview.map((file, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{file.fileName}</h4>
                          <span className="text-sm text-muted-foreground">
                            共 {file.rowCount} 条数据
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                {Object.keys(file.data[0] || {}).map((key) => (
                                  <th key={key} className="border p-2">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {file.data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {Object.values(row).map(
                                    (value: any, colIndex) => (
                                      <td key={colIndex} className="border p-2">
                                        {value?.toString() || ""}
                                      </td>
                                    )
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {file.rowCount > 5 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            仅显示前 5 条数据
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧说明文档 */}
        <div className="h-[calc(100vh-5rem)] overflow-y-auto rounded-lg border">
          <div className="p-6 space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Excel 格式要求：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>文件格式：.xlsx 或 .xls</li>
                <li>第一行必须是字段名（表头）</li>
                <li>字段名必须与下面列出的完全匹配（区分大小写）</li>
                <li>日期格式：YYYY-MM-DD 或 YYYY/MM/DD</li>
                <li>数值字段支持小数点</li>
                <li>缺失值可以留空或填写数字9</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">必填字段：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>station: 站点名称（字符串）</li>
                <li>date: 日期</li>
                <li>latitude: 纬度（°），精度0.01</li>
                <li>longitude: 经度（°），精度0.01</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">可选字段：</h3>
              <div className="grid grid-cols-1 gap-4">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>visibility: 能见度（km）</li>
                  <li>airTemperature: 气温（°C）</li>
                  <li>windDirection: 风向（°）</li>
                  <li>windSpeed: 风速（m/s）</li>
                  <li>airPressure: 气压（hPa）</li>
                  <li>precipitation: 降水量（ml）</li>
                  <li>seaTemperature: 海温（°C）</li>
                  <li>windWaveHeight: 风浪高（m）</li>
                  <li>windWavePeriod: 风浪周期（s）</li>
                  <li>surgeHeight: 涨潮高（m）</li>
                  <li>surgePeriod: 涨潮周期（s）</li>
                  <li>waterLevel: 水位（m）</li>
                  <li>currentSpeed: 流速（m/s）</li>
                  <li>currentDirection: 流向（°）</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Excel 示例：</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border p-2">station</th>
                      <th className="border p-2">date</th>
                      <th className="border p-2">latitude</th>
                      <th className="border p-2">longitude</th>
                      <th className="border p-2">visibility</th>
                      <th className="border p-2">airTemperature</th>
                      <th className="border p-2">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">站点A</td>
                      <td className="border p-2">2024-03-20</td>
                      <td className="border p-2">39.90</td>
                      <td className="border p-2">116.40</td>
                      <td className="border p-2">10.5</td>
                      <td className="border p-2">25.6</td>
                      <td className="border p-2">...</td>
                    </tr>
                    <tr>
                      <td className="border p-2">站点B</td>
                      <td className="border p-2">2024/03/20</td>
                      <td className="border p-2">31.22</td>
                      <td className="border p-2">121.48</td>
                      <td className="border p-2">9</td>
                      <td className="border p-2"></td>
                      <td className="border p-2">...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">注意事项：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>站点名称和日期的组合必须唯一</li>
                <li>如果上传重复数据，系统会提示是否覆盖</li>
                <li>建议每个文件数据量不超过1000条</li>
                <li>上传前请仔细检查数据格式是否正确</li>
                <li>数值类型字段如果无观测数据，可以留空或填写数字9</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>发现重复数据</AlertDialogTitle>
            <AlertDialogDescription>
              发现{duplicateData.length}条重复数据。是否要覆盖现有数据？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                uploadData(duplicateData, true);
                setShowDuplicateDialog(false);
              }}
            >
              覆盖
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
