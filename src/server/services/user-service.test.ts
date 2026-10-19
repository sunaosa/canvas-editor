import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 单元测试只关心业务分支:数据层和加密层全部替换为 mock
vi.mock("@/server/db/user", () => ({
    userRepository: {
        findById: vi.fn(),
        findByUuid: vi.fn(),
        findByUsername: vi.fn(),
        findByEmail: vi.fn(),
        findByUsernameOrEmail: vi.fn(),
        create: vi.fn(),
        updateLoginInfo: vi.fn(),
    },
}));
vi.mock("@/server/utils/auth", () => ({
    hashPassword: vi.fn(async () => "hashed-password"),
    verifyPassword: vi.fn(async () => true),
    signToken: vi.fn(() => "signed-token"),
}));

import { userRepository } from "@/server/db/user";
import { toSafeUser, userService } from "@/server/services/user-service";
import { verifyPassword } from "@/server/utils/auth";

function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 1n,
        uuid: "uuid-1",
        username: "alice",
        email: "alice@example.com",
        passwordHash: "hashed-password",
        displayName: null,
        avatarUrl: null,
        status: 1,
        lastLoginAt: new Date("2026-01-01T00:00:00Z"),
        lastLoginIp: null,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
        ...overrides,
    };
}

beforeEach(() => {
    vi.resetAllMocks();
});

describe("userService.register", () => {
    it("注册成功:剥离 passwordHash、id 转 number、返回 token", async () => {
        vi.mocked(userRepository.findByUsername).mockResolvedValue(null);
        vi.mocked(userRepository.create).mockResolvedValue(makeUser());

        const result = await userService.register({
            username: "alice",
            password: "secret123",
        });

        expect(result.token).toBe("signed-token");
        expect(result.user.id).toBe(1);
        expect(result.user.username).toBe("alice");
        expect(result.user).not.toHaveProperty("passwordHash");
    });

    it("用户名已占用:抛 USERNAME_TAKEN,且不落库", async () => {
        vi.mocked(userRepository.findByUsername).mockResolvedValue(makeUser());

        await expect(
            userService.register({ username: "alice", password: "secret123" }),
        ).rejects.toMatchObject({ code: "USERNAME_TAKEN" });
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("邮箱已注册:抛 EMAIL_TAKEN", async () => {
        vi.mocked(userRepository.findByUsername).mockResolvedValue(null);
        vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

        await expect(
            userService.register({
                username: "alice",
                email: "alice@example.com",
                password: "secret123",
            }),
        ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
    });

    it("并发竞态:create 撞唯一约束(P2002)时转成 USERNAME_TAKEN 而非 500", async () => {
        vi.mocked(userRepository.findByUsername).mockResolvedValue(null);
        vi.mocked(userRepository.create).mockRejectedValue(
            Object.assign(new Error("Unique constraint failed"), {
                code: "P2002",
            }),
        );

        await expect(
            userService.register({ username: "alice", password: "secret123" }),
        ).rejects.toMatchObject({ code: "USERNAME_TAKEN" });
    });

    it("其他创建异常原样抛出,不吞错", async () => {
        vi.mocked(userRepository.findByUsername).mockResolvedValue(null);
        vi.mocked(userRepository.create).mockRejectedValue(
            new Error("db down"),
        );

        await expect(
            userService.register({ username: "alice", password: "secret123" }),
        ).rejects.toThrow("db down");
    });
});

describe("userService.login", () => {
    it("登录成功:返回的是本次更新后的记录(lastLoginAt 不是旧值)", async () => {
        const before = makeUser({
            lastLoginAt: new Date("2026-01-01T00:00:00Z"),
        });
        const after = makeUser({
            lastLoginAt: new Date("2026-09-11T08:00:00Z"),
        });
        vi.mocked(userRepository.findByUsernameOrEmail).mockResolvedValue(
            before,
        );
        vi.mocked(verifyPassword).mockResolvedValue(true);
        vi.mocked(userRepository.updateLoginInfo).mockResolvedValue(after);

        const result = await userService.login(
            { username: "alice", password: "secret123" },
            "127.0.0.1",
        );

        expect(userRepository.updateLoginInfo).toHaveBeenCalledWith(
            1n,
            "127.0.0.1",
        );
        expect(result.user.lastLoginAt).toEqual(
            new Date("2026-09-11T08:00:00Z"),
        );
    });

    it("用户不存在:同样执行一次 bcrypt 比较(抹平时延)后抛 INVALID_CREDENTIALS", async () => {
        vi.mocked(userRepository.findByUsernameOrEmail).mockResolvedValue(null);

        await expect(
            userService.login(
                { username: "nobody", password: "whatever" },
                null,
            ),
        ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
        // 如果没有这次 dummy compare,攻击者可按响应时间枚举用户名
        expect(verifyPassword).toHaveBeenCalledTimes(1);
    });

    it("账号被禁用:抛 ACCOUNT_DISABLED", async () => {
        vi.mocked(userRepository.findByUsernameOrEmail).mockResolvedValue(
            makeUser({ status: 0 }),
        );

        await expect(
            userService.login(
                { username: "alice", password: "secret123" },
                null,
            ),
        ).rejects.toMatchObject({ code: "ACCOUNT_DISABLED" });
    });

    it("密码错误:抛 INVALID_CREDENTIALS", async () => {
        vi.mocked(userRepository.findByUsernameOrEmail).mockResolvedValue(
            makeUser(),
        );
        vi.mocked(verifyPassword).mockResolvedValue(false);

        await expect(
            userService.login({ username: "alice", password: "wrong" }, null),
        ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    });
});

describe("toSafeUser", () => {
    it("剥离 passwordHash 并把 BigInt id 转为 number", () => {
        const safe = toSafeUser(makeUser({ id: 42n }));
        expect(safe.id).toBe(42);
        expect(safe).not.toHaveProperty("passwordHash");
    });
});
