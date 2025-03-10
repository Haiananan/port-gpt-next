#!/bin/sh

# 等待一段时间确保系统稳定
echo "Waiting for system to be ready..."
sleep 2

# 确保数据库目录存在
mkdir -p /app/prisma
touch /app/prisma/db.sqlite

# 运行数据库迁移（在生产环境中应谨慎使用）
echo "Running database migrations..."
npx prisma migrate deploy

# 启动应用
echo "Starting application..."
exec pnpm start 