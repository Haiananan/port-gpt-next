/**
 * 数据导入脚本 - 优化版
 * 该脚本用于将src/data/station目录下的TXT文件导入到数据库
 * 添加了进度条、批量导入和错误处理功能
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { SingleBar, Presets } from "cli-progress";
import { fileURLToPath } from "url";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 动态导入 ora 和 chalk (因为它们是 ESM 模块)
const importDeps = async () => {
  const oraModule = await import("ora");
  const chalkModule = await import("chalk");
  return {
    ora: oraModule.default,
    chalk: chalkModule.default,
  };
};

const prisma = new PrismaClient();

// 定义数据接口
interface CoastalData {
  station: string;
  date: Date;
  latitude: number;
  longitude: number;
  visibility: number | null;
  airTemperature: number | null;
  windDirection: number | null;
  windSpeed: number | null;
  airPressure: number | null;
  precipitation: number | null;
  seaTemperature: number | null;
  windWaveHeight: number | null;
  windWavePeriod: number | null;
  surgeHeight: number | null;
  surgePeriod: number | null;
}

/**
 * 检查值是否有效（999.9和9999.9是无效值）
 */
function isValidValue(value: number): boolean {
  return !Number.isNaN(value) && value !== 999.9 && value !== 9999.9;
}

/**
 * 处理单个文件并导入数据
 */
async function processFile(filePath: string): Promise<boolean> {
  const { ora, chalk } = await importDeps();

  try {
    const spinner = ora(`读取文件: ${path.basename(filePath)}`).start();
    const data = fs.readFileSync(filePath, "utf-8");
    const filename = path.basename(filePath);
    const year = "20" + filename.slice(-8, -6);
    const month = filename.slice(-6, -4);

    const lines = data.split("\n").filter((line: string) => line.length >= 100);
    spinner.succeed(`文件读取成功: ${path.basename(filePath)}`);

    console.log(`处理 ${lines.length} 条记录...`);

    // 进度条设置
    const progressBar = new SingleBar(
      {
        format: `处理进度 |${chalk.cyan(
          "{bar}"
        )}| {percentage}% || {value}/{total} 条记录`,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true as const,
      },
      Presets.shades_classic
    );

    progressBar.start(lines.length, 0);

    // 批量处理数据
    const batchSize = 100;
    const dataToInsert: CoastalData[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 解析数据
      const station = line.slice(0, 15).trim();
      const day = line.slice(15, 19).trim();
      const time = line.slice(19, 23).trim();
      const date = dayjs(`${year}-${month}-${day} ${time}`).toDate();

      const latitude = parseFloat(line.slice(23, 29).trim());
      const longitude = parseFloat(line.slice(29, 36).trim());
      const visibility = parseFloat(line.slice(36, 43).trim());
      const airTemperature = parseFloat(line.slice(43, 50).trim());
      const windDirection = parseFloat(line.slice(50, 57).trim());
      const windSpeed = parseFloat(line.slice(57, 64).trim());
      const airPressure = parseFloat(line.slice(64, 71).trim());
      const precipitation = parseFloat(line.slice(71, 77).trim());
      const seaTemperature = parseFloat(line.slice(77, 83).trim());
      const windWaveHeight = parseFloat(line.slice(83, 89).trim());
      const windWavePeriod = parseFloat(line.slice(89, 95).trim());
      const surgeHeight = parseFloat(line.slice(95, 101).trim());
      const surgePeriod = parseFloat(line.slice(101, 107).trim());

      // 创建记录对象
      const record: CoastalData = {
        station,
        date,
        latitude,
        longitude,
        visibility: isValidValue(visibility) ? visibility : null,
        airTemperature: isValidValue(airTemperature) ? airTemperature : null,
        windDirection: isValidValue(windDirection) ? windDirection : null,
        windSpeed: isValidValue(windSpeed) ? windSpeed : null,
        airPressure: isValidValue(airPressure) ? airPressure : null,
        precipitation: isValidValue(precipitation) ? precipitation : null,
        seaTemperature: isValidValue(seaTemperature) ? seaTemperature : null,
        windWaveHeight: isValidValue(windWaveHeight) ? windWaveHeight : null,
        windWavePeriod: isValidValue(windWavePeriod) ? windWavePeriod : null,
        surgeHeight: isValidValue(surgeHeight) ? surgeHeight : null,
        surgePeriod: isValidValue(surgePeriod) ? surgePeriod : null,
      };

      dataToInsert.push(record);

      // 批量插入逻辑
      if (dataToInsert.length >= batchSize || i === lines.length - 1) {
        if (dataToInsert.length > 0) {
          try {
            await prisma.coastalStationData.createMany({
              data: dataToInsert,
            });
          } catch (error) {
            console.error(chalk.red(`批量导入失败:`), error);
          }
        }

        progressBar.update(i + 1);
        dataToInsert.length = 0;
      }
    }

    progressBar.stop();
    return true;
  } catch (error) {
    const { chalk } = await importDeps();
    console.error(
      chalk.red(`处理文件 ${path.basename(filePath)} 时出错:`),
      error
    );
    return false;
  }
}

/**
 * 获取已处理文件记录
 */
function getProcessedFiles(recordPath: string): Set<string> {
  try {
    if (!fs.existsSync(recordPath)) {
      fs.writeFileSync(recordPath, "", "utf-8");
      return new Set();
    }

    const records = fs
      .readFileSync(recordPath, "utf-8")
      .split("\n")
      .filter((line: string) => line.trim().length > 0);

    return new Set(records);
  } catch (error) {
    console.error("读取记录文件时出错:", error);
    return new Set();
  }
}

/**
 * 更新已处理文件记录
 */
function updateProcessedRecord(recordPath: string, filePath: string): void {
  try {
    fs.appendFileSync(recordPath, filePath + "\n");
  } catch (error) {
    console.error("更新记录文件时出错:", error);
  }
}

/**
 * 清理异常数据
 */
async function cleanupData(): Promise<void> {
  const { ora } = await importDeps();
  const spinner = ora("清理异常数据...").start();

  try {
    const result = await prisma.coastalStationData.updateMany({
      where: {
        windWavePeriod: {
          gte: 99,
        },
      },
      data: { windWavePeriod: null },
    });

    spinner.succeed(`完成数据清理: ${result.count} 条记录已更新`);
  } catch (error) {
    spinner.fail("数据清理失败");
    console.error(error);
  }
}

/**
 * 主程序
 */
async function main(): Promise<void> {
  const { chalk, ora } = await importDeps();

  console.log(chalk.green("===== 开始导入沿海站点数据 ====="));

  // 设置文件路径
  const dataDir = path.join(__dirname, "../data/station");
  const recordFilePath = path.join(__dirname, "record.txt");

  // 获取已处理文件记录
  const processedFiles = getProcessedFiles(recordFilePath);

  // 读取数据目录下的所有文件
  const spinner = ora("扫描数据文件...").start();
  let files: string[] = [];

  try {
    files = fs
      .readdirSync(dataDir)
      .filter((file: string) => path.extname(file).toLowerCase() === ".txt")
      .sort();

    spinner.succeed(`找到 ${files.length} 个数据文件`);
  } catch (error) {
    spinner.fail("扫描数据文件失败");
    console.error(error);
    return;
  }

  // 筛选未处理的文件
  const filesToProcess = files.filter((file: string) => {
    const filePath = path.join(dataDir, file);
    return !processedFiles.has(filePath);
  });

  console.log(
    chalk.blue(
      `需要处理 ${filesToProcess.length} 个文件，已处理 ${processedFiles.size} 个文件`
    )
  );

  // 处理每个文件
  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    const filePath = path.join(dataDir, file);

    console.log(
      chalk.yellow(`\n[${i + 1}/${filesToProcess.length}] 处理文件: ${file}`)
    );

    const result = await processFile(filePath);

    if (result) {
      updateProcessedRecord(recordFilePath, filePath);
      console.log(chalk.green(`文件 ${file} 处理完成，已记录`));
    } else {
      console.log(chalk.red(`文件 ${file} 处理失败，跳过记录`));
    }
  }

  // 清理数据
  await cleanupData();

  console.log(chalk.green("\n===== 导入完成 ====="));

  if (filesToProcess.length === 0) {
    console.log(chalk.blue("没有新文件需要处理"));
  } else {
    console.log(chalk.blue(`成功处理 ${filesToProcess.length} 个文件`));
  }
}

// 执行主程序
main()
  .catch(async (error) => {
    const { chalk } = await importDeps();
    console.error(chalk.red("程序执行出错:"), error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
