# 多阶段构建: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 先复制package.json和lockfile以利用缓存
COPY package.json pnpm-lock.yaml* ./

# 安装pnpm
RUN npm i pnpm -g

# 安装依赖 (--ignore-scripts 跳过postinstall脚本)
RUN pnpm install --frozen-lockfile --ignore-scripts

# 复制所有项目文件
COPY . .

# 手动生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN pnpm build

# 多阶段构建: 生产环境阶段
FROM node:20-alpine AS runner

# 设置容器名称
LABEL name="portgpt"

# 安装pnpm
RUN npm i pnpm -g

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV DATABASE_URL="file:/app/prisma/db.sqlite"

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# SQLite数据库目录
RUN mkdir -p /app/prisma && \
    chown -R nextjs:nodejs /app

# 复制构建产物和必要文件
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js* ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 复制Prisma相关文件和数据库
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.env ./

# 复制启动脚本
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./
RUN chmod +x /app/start.sh

# 确保SQLite数据库目录权限正确
RUN chown -R nextjs:nodejs /app/prisma

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["/app/start.sh"] 