import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";
import colors from "ansi-colors";

const prisma = new PrismaClient();

const STATION_NAMES: { [key: string]: string } = {
  "0001": "Shidao",
  "0002": "Xiaomaidao",
  "0003": "Lianyungang",
  "0004": "Yinshuichuan",
};

interface HeaderRecord {
  stationCode: string;
  latitude: number;
  longitude: number;
  year: number;
  month: number;
  tempAccuracy: number;
  salinityAccuracy: number;
}

interface DataRecord {
  day: number;
  temp08: number;
  temp14: number;
  temp20: number;
  salinity: number;
}

function parseHeaderRecord(line: string): HeaderRecord {
  const stationCode = line.substring(3, 7).trim();

  return {
    stationCode,
    latitude:
      parseFloat(line.substring(23, 25)) +
      parseFloat(line.substring(25, 27)) / 60 +
      parseFloat(line.substring(27, 28)) / 600,
    longitude:
      parseFloat(line.substring(29, 32)) +
      parseFloat(line.substring(32, 34)) / 60 +
      parseFloat(line.substring(34, 35)) / 600,
    year: parseInt(line.substring(36, 40)),
    month: parseInt(line.substring(40, 42)),
    tempAccuracy: parseInt(line.charAt(43)),
    salinityAccuracy: parseInt(line.charAt(44)),
  };
}

function parseDataRecord(line: string): DataRecord | null {
  if (line.charAt(0) !== "2") return null;

  return {
    day: parseInt(line.substring(2, 4)),
    temp08: parseFloat(line.substring(4, 8)) / 10,
    temp14: parseFloat(line.substring(16, 20)) / 10,
    temp20: parseFloat(line.substring(28, 32)) / 10,
    salinity: parseFloat(line.substring(40, 45)) / 1000,
  };
}

interface ImportProgress {
  file: string;
  processedRecords: number;
  totalRecords: number;
  lastProcessedDate?: Date;
}

function loadProgress(): ImportProgress | null {
  const progressFile = path.join(process.cwd(), ".import-progress.json");
  if (fs.existsSync(progressFile)) {
    const data = JSON.parse(fs.readFileSync(progressFile, "utf-8"));
    data.lastProcessedDate = data.lastProcessedDate
      ? new Date(data.lastProcessedDate)
      : undefined;
    return data;
  }
  return null;
}

function saveProgress(progress: ImportProgress) {
  const progressFile = path.join(process.cwd(), ".import-progress.json");
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

async function importFile(filePath: string, progress?: ImportProgress) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const header = parseHeaderRecord(lines[0]);
  const records: DataRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const record = parseDataRecord(lines[i]);
    if (record) records.push(record);
  }

  const startTime = Date.now();
  let processedCount = 0;

  const progressBar = new cliProgress.SingleBar({
    format: `${colors.cyan(
      "{bar}"
    )} {percentage}% | ETA: {eta}s | {value}/{total} records | Speed: {speed} records/s`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
  });

  progressBar.start(records.length, 0);

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const recordDate = new Date(header.year, header.month - 1, record.day);

    try {
      await prisma.salinityData.upsert({
        where: {
          stationCode_date: {
            stationCode: header.stationCode,
            date: recordDate,
          },
        },
        update: {
          temp08: record.temp08,
          temp14: record.temp14,
          temp20: record.temp20,
          salinity: record.salinity,
          latitude: header.latitude,
          longitude: header.longitude,
          tempAccuracy: header.tempAccuracy,
          salinityAccuracy: header.salinityAccuracy,
          stationName: STATION_NAMES[header.stationCode] || "Unknown",
        },
        create: {
          stationCode: header.stationCode,
          stationName: STATION_NAMES[header.stationCode] || "Unknown",
          date: recordDate,
          latitude: header.latitude,
          longitude: header.longitude,
          temp08: record.temp08,
          temp14: record.temp14,
          temp20: record.temp20,
          salinity: record.salinity,
          tempAccuracy: header.tempAccuracy,
          salinityAccuracy: header.salinityAccuracy,
        },
      });

      processedCount++;
      const elapsedTime = (Date.now() - startTime) / 1000;
      const speed = Math.round(processedCount / elapsedTime);

      progressBar.update(processedCount, { speed });
    } catch (error) {
      console.error(`\nError importing record for date ${record.day}:`, error);
    }
  }

  progressBar.stop();
}

async function importAllFiles() {
  const dataDir = path.join(process.cwd(), "src/data/salt");
  const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".txt"));

  // 加载上次的进度
  const progress = loadProgress();
  let startFileIndex = 0;

  if (progress) {
    startFileIndex = files.findIndex((f) => f === progress.file);
    console.log(colors.yellow("\nResuming from previous import..."));
    console.log(colors.yellow(`File: ${progress.file}`));
    console.log(
      colors.yellow(
        `Progress: ${progress.processedRecords}/${progress.totalRecords}\n`
      )
    );
  }

  for (let i = startFileIndex; i < files.length; i++) {
    const file = files[i];
    console.log(
      colors.cyan(`\nProcessing file ${i + 1}/${files.length}: ${file}`)
    );
    await importFile(
      path.join(dataDir, file),
      i === startFileIndex && progress ? progress : undefined
    );
  }

  console.log(colors.green("\nImport completed!"));
}

// 处理中断信号
process.on("SIGINT", () => {
  console.log(
    colors.yellow("\n\nImport interrupted. Progress has been saved.")
  );
  process.exit(0);
});

importAllFiles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
