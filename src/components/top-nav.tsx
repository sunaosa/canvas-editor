"use client";

import { App, Dropdown, Tooltip } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import styled from "styled-components";
import { useTheme } from "@/app/theme-provider";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { MoonIcon, SparkIcon, SunIcon } from "./icons";
import { LogoMark } from "./logo";
import { IconButton } from "./ui";

/** 未登录用户点 chat 模块时统一引导到登录 */
function gotoChat(router: ReturnType<typeof useRouter>, loggedIn: boolean) {
    if (loggedIn) {
        router.push("/chat");
    } else {
        router.push("/login?redirect=/chat");
    }
}

export default function TopNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { message } = App.useApp();

    const user = useAuthStore((s) => s.user);
    const initialized = useAuthStore((s) => s.initialized);
    const fetchMe = useAuthStore((s) => s.fetchMe);
    const logout = useAuthStore((s) => s.logout);

    // 首次进入 nav 时拉一次用户态,避免把已登录误判成未登录
    useEffect(() => {
        if (!initialized) {
            fetchMe();
        }
    }, [initialized, fetchMe]);

    const isLoggedIn = Boolean(user);
    const path = pathname ?? "/";

    const handleNav = (key: string) => {
        if (key === "/chat") {
            gotoChat(router, isLoggedIn);
            return;
        }
        router.push(key);
    };

    const handleLogout = async () => {
        try {
            await logout();
            message.success("已退出登录");
            router.push("/");
            router.refresh();
        } catch (error) {
            const msg =
                error instanceof ApiError ? error.message : "退出失败,请重试";
            message.error(msg);
        }
    };

    const userMenu = {
        items: [
            {
                key: "logout",
                label: "退出登录",
                onClick: handleLogout,
            },
        ],
    };

    return (
        <Bar>
            <Left>
                <Brand onClick={() => router.push("/")}>
                    <LogoMark size={26} />
                    <BrandName>Canvas Editor</BrandName>
                </Brand>

                <Nav>
                    <NavItem
                        href="/"
                        $active={path === "/"}
                        onClick={(e) => {
                            e.preventDefault();
                            handleNav("/");
                        }}
                    >
                        手绘
                    </NavItem>
                    <NavItem
                        href="/chat"
                        $active={path.startsWith("/chat")}
                        onClick={(e) => {
                            e.preventDefault();
                            handleNav("/chat");
                        }}
                    >
                        <SparkIcon size={15} />
                        AI 对话
                    </NavItem>
                </Nav>
            </Left>

            <Right>
                <Tooltip
                    title={theme.darkMode ? "切换到浅色模式" : "切换到深色模式"}
                    placement="bottomRight"
                >
                    <IconButton
                        $size={34}
                        aria-label={
                            theme.darkMode ? "切换到浅色模式" : "切换到深色模式"
                        }
                        onClick={toggleTheme}
                    >
                        {theme.darkMode ? (
                            <SunIcon size={17} />
                        ) : (
                            <MoonIcon size={17} />
                        )}
                    </IconButton>
                </Tooltip>

                {isLoggedIn && user ? (
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <UserBadge>
                            <Avatar>
                                {(user.displayName || user.username)
                                    .charAt(0)
                                    .toUpperCase()}
                            </Avatar>
                            <UserName>
                                {user.displayName || user.username}
                            </UserName>
                        </UserBadge>
                    </Dropdown>
                ) : (
                    <LoginLink href="/login">登录</LoginLink>
                )}
            </Right>
        </Bar>
    );
}

const Bar = styled.header`
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    height: 56px;
    padding: 0 20px;
    background: color-mix(in srgb, ${({ theme }) => theme.colors.board} 88%, transparent);
    border-bottom: 1px solid ${({ theme }) => theme.colors.rule};
    backdrop-filter: blur(10px);

    @media (max-width: 640px) {
        padding: 0 14px;
        gap: 12px;
    }
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 22px;
    min-width: 0;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex: none;
`;

const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: 9px;
    cursor: pointer;
    user-select: none;
    flex: none;
`;

const BrandName = styled.span`
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 14.5px;
    font-weight: 600;
    letter-spacing: 0.07em;
    color: ${({ theme }) => theme.colors.ink};
    white-space: nowrap;

    @media (max-width: 520px) {
        display: none;
    }
`;

const Nav = styled.nav`
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 12px;
    font-size: 13.5px;
    font-weight: 500;
    text-decoration: none;
    color: ${({ $active, theme }) =>
        $active ? theme.colors.ink : theme.colors.inkSoft};

    &::after {
        content: "";
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: -1px;
        height: 2px;
        background: ${({ $active, theme }) =>
            $active ? theme.colors.accent : "transparent"};
        transition: background 0.18s ease;
    }

    &:hover {
        color: ${({ theme }) => theme.colors.ink};
    }
`;

const UserBadge = styled.button.attrs({ type: "button" })`
    display: flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding: 0 12px 0 4px;
    border: 1px solid ${({ theme }) => theme.colors.rule};
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: color-mix(in srgb, ${({ theme }) => theme.colors.ink} 6%, transparent);
    }
`;

const Avatar = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
`;

const UserName = styled.span`
    max-width: 130px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.ink};
`;

const LoginLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    height: 34px;
    padding: 0 16px;
    border-radius: 6px;
    background: ${({ theme }) => theme.colors.accent};
    color: #ffffff;
    font-size: 13.5px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s ease;

    &:hover {
        background: ${({ theme }) => theme.colors.accentInk};
    }
`;
