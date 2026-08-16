import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 配置
 * - schema 内不再写 url
 * - 连接 URL 通过 datasource.url 配置
 * - 运行时连接由 PrismaClient 构造时通过 driver adapter 提供
 */
export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),
    migrations: {
        path: path.join("prisma", "migrations"),
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
