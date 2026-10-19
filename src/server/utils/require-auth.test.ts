import type { User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth", () => ({
    extractToken: vi.fn(),
    verifyToken: vi.fn(),
}));
vi.mock("@/server/services/user-service", () => ({
    userService: {
        getByUuid: vi.fn(),
    },
}));

import type { NextRequest } from "next/server";
import { userService } from "@/server/services/user-service";
import { extractToken, verifyToken } from "./auth";
import { requireAuth } from "./require-auth";

/** requireAuth 只用到 cookies.get 和 headers.get,构造最小请求对象即可 */
function fakeRequest(opts: {
    cookie?: string;
    authHeader?: string;
}): NextRequest {
    return {
        cookies: {
            get: (name: string) =>
                name === "token" && opts.cookie
                    ? { value: opts.cookie }
                    : undefined,
        },
        headers: {
            get: (name: string) =>
                name === "authorization" ? (opts.authHeader ?? null) : null,
        },
    } as unknown as NextRequest;
}

function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 7n,
        uuid: "uuid-7",
        username: "alice",
        email: null,
        passwordHash: "hashed-password",
        displayName: null,
        avatarUrl: null,
        status: 1,
        lastLoginAt: null,
        lastLoginIp: null,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
        ...overrides,
    };
}

beforeEach(() => {
    vi.resetAllMocks();
});

describe("requireAuth", () => {
    it("没有任何 token:返回 null,不查库", async () => {
        vi.mocked(extractToken).mockReturnValue(null);

        expect(await requireAuth(fakeRequest({}))).toBeNull();
        expect(userService.getByUuid).not.toHaveBeenCalled();
    });

    it("token 验签失败(伪造/过期):返回 null", async () => {
        vi.mocked(extractToken).mockReturnValue("bad-token");
        vi.mocked(verifyToken).mockReturnValue(null);

        expect(
            await requireAuth(fakeRequest({ cookie: "bad-token" })),
        ).toBeNull();
    });

    it("验签通过但用户已不存在:返回 null", async () => {
        vi.mocked(extractToken).mockReturnValue("good-token");
        vi.mocked(verifyToken).mockReturnValue({
            uid: 7,
            sub: "uuid-7",
            username: "alice",
        });
        vi.mocked(userService.getByUuid).mockResolvedValue(null);

        expect(
            await requireAuth(fakeRequest({ cookie: "good-token" })),
        ).toBeNull();
    });

    it("验签通过但账号被禁用:返回 null", async () => {
        vi.mocked(extractToken).mockReturnValue("good-token");
        vi.mocked(verifyToken).mockReturnValue({
            uid: 7,
            sub: "uuid-7",
            username: "alice",
        });
        vi.mocked(userService.getByUuid).mockResolvedValue(
            makeUser({ status: 0 }),
        );

        expect(
            await requireAuth(fakeRequest({ cookie: "good-token" })),
        ).toBeNull();
    });

    it("验签通过且账号正常:返回 AuthContext(BigInt userId)", async () => {
        vi.mocked(extractToken).mockReturnValue("good-token");
        vi.mocked(verifyToken).mockReturnValue({
            uid: 7,
            sub: "uuid-7",
            username: "alice",
        });
        vi.mocked(userService.getByUuid).mockResolvedValue(makeUser());

        const auth = await requireAuth(fakeRequest({ cookie: "good-token" }));
        expect(auth).toEqual({ userId: 7n, uuid: "uuid-7", username: "alice" });
    });
});
