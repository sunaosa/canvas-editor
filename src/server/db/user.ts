import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * 用户数据访问层
 * 只负责数据库 CRUD，业务逻辑放在 user-service 中
 */

export const userRepository = {
    /**
     * 通过 ID 查询
     */
    findById(id: bigint | number) {
        return prisma.user.findUnique({ where: { id } });
    },

    /**
     * 通过 UUID 查询
     */
    findByUuid(uuid: string) {
        return prisma.user.findUnique({ where: { uuid } });
    },

    /**
     * 通过用户名查询
     */
    findByUsername(username: string) {
        return prisma.user.findUnique({ where: { username } });
    },

    /**
     * 通过邮箱查询
     */
    findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    /**
     * 通过用户名或邮箱查询
     */
    findByUsernameOrEmail(usernameOrEmail: string) {
        return prisma.user.findFirst({
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
        });
    },

    /**
     * 创建用户
     */
    create(data: Prisma.UserCreateInput) {
        return prisma.user.create({ data });
    },

    /**
     * 更新登录信息
     */
    updateLoginInfo(id: bigint | number, ip: string | null) {
        return prisma.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: ip,
            },
        });
    },
};
