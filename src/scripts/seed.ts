const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const prisma = new PrismaClient();

async function handleFile(filePath: string) {
  const data = fs.readFileSync(filePath, "utf-8");
  const year = "20" + filePath.slice(-8, -6);
  const month = filePath.slice(-6, -4);
  const lines = data.split("\n");
  for (const line of lines) {
    if (line.length < 100) continue;
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

    function isValidFloat(value: number) {
      return value === 999.9 || value === 9999.9;
    }

    const processedData = {
      station,
      date,
      latitude,
      longitude,
      visibility: isValidFloat(visibility) ? null : visibility,
      airTemperature: isValidFloat(airTemperature) ? null : airTemperature,
      windDirection: isValidFloat(windDirection) ? null : windDirection,
      windSpeed: isValidFloat(windSpeed) ? null : windSpeed,
      airPressure: isValidFloat(airPressure) ? null : airPressure,
      precipitation: isValidFloat(precipitation) ? null : precipitation,
      seaTemperature: isValidFloat(seaTemperature) ? null : seaTemperature,
      windWaveHeight: isValidFloat(windWaveHeight) ? null : windWaveHeight,
      windWavePeriod: isValidFloat(windWavePeriod) ? null : windWavePeriod,
      surgeHeight: isValidFloat(surgeHeight) ? null : surgeHeight,
      surgePeriod: isValidFloat(surgePeriod) ? null : surgePeriod,
    };

    prisma.coastalStationData
      .create({
        data: processedData,
      })
      .then(() => {})
      .catch((e: any) => {
        console.error(e);
      });
  }
  console.log(`Processed ${filePath}`);
  return true;
}

async function main() {
  const dataDir = path.join(__dirname, "./data");
  const files = fs.readdirSync(dataDir);

  // 确保 record.txt 文件存在
  const recordFilePath = path.join(__dirname, "record.txt");
  if (!fs.existsSync(recordFilePath)) {
    fs.writeFileSync(recordFilePath, ""); // 创建空文件
  }

  const record = fs.readFileSync(recordFilePath, "utf-8");
  console.log(record);

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (record.includes(filePath)) {
      console.log(`Skipping ${filePath} because it has already been processed`);
      continue;
    }
    const result = await handleFile(filePath);
    if (result) {
      fs.appendFileSync(recordFilePath, filePath + "\n");
    }
  }
}

async function fresh() {
  const res = await prisma.coastalStationData.updateMany({
    where: {
      windWavePeriod: {
        gte: 99,
      },
    },
    data: { windWavePeriod: null },
  });
  console.log("已将大于 99 的数据更新为null", res.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
