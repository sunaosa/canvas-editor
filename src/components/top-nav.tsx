"use client";

import { App, Badge, Button, Dropdown, Menu, Tooltip, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import styled from "styled-components";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "../app/theme-provider";

const { Text } = Typography;

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
    const { theme } = useTheme();
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

    const selectedKeys = pathname.startsWith("/chat") ? ["/chat"] : ["/"];
    const isLoggedIn = Boolean(user);

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
        <Bar
            $bg={theme.colors.backgroundSecondary}
            $border={theme.colors.border}
        >
            <Left>
                <Logo
                    onClick={() => router.push("/")}
                    role="button"
                    tabIndex={0}
                >
                    <LogoIcon>🎨</LogoIcon>
                    <LogoText $color={theme.colors.text}>
                        Canvas Editor
                    </LogoText>
                </Logo>

                <Menu
                    mode="horizontal"
                    selectedKeys={selectedKeys}
                    onClick={({ key }) => handleNav(key)}
                    style={{
                        background: "transparent",
                        borderBottom: "none",
                        minWidth: 320,
                    }}
                    items={[
                        {
                            key: "/",
                            label: "✏️ 手绘",
                        },
                        {
                            key: "/chat",
                            label: "🤖 AI 对话",
                        },
                    ]}
                />
            </Left>

            <Right>
                <Tooltip
                    title={
                        isLoggedIn ? "打开 AI 对话" : "登录后即可使用 AI 对话"
                    }
                    placement="bottomRight"
                >
                    <ChatRobotButton
                        type="text"
                        shape="circle"
                        size="large"
                        aria-label="AI 对话"
                        onClick={() => gotoChat(router, isLoggedIn)}
                        $color={theme.colors.primary}
                    >
                        <Badge dot={isLoggedIn} color={theme.colors.primary}>
                            <RobotAvatar $bg={theme.colors.primary}>
                                🤖
                            </RobotAvatar>
                        </Badge>
                    </ChatRobotButton>
                </Tooltip>

                {isLoggedIn && user ? (
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <UserBadge $border={theme.colors.border}>
                            <Avatar $bg={theme.colors.primary}>
                                {(user.displayName || user.username)
                                    .charAt(0)
                                    .toUpperCase()}
                            </Avatar>
                            <Text
                                style={{
                                    color: theme.colors.text,
                                    marginLeft: 8,
                                    maxWidth: 140,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user.displayName || user.username}
                            </Text>
                        </UserBadge>
                    </Dropdown>
                ) : (
                    <Button
                        type="primary"
                        onClick={() => router.push("/login")}
                        style={{ borderRadius: 8 }}
                    >
                        登录
                    </Button>
                )}
            </Right>
        </Bar>
    );
}

const Bar = styled.header<{ $bg: string; $border: string }>`
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 0 24px;
    height: 64px;
    background: ${({ $bg }) => $bg};
    border-bottom: 1px solid ${({ $border }) => $border};
    backdrop-filter: blur(8px);
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
    min-width: 0;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
`;

const LogoIcon = styled.span`
    font-size: 24px;
`;

const LogoText = styled.span<{ $color: string }>`
    font-size: 16px;
    font-weight: 600;
    color: ${({ $color }) => $color};
    white-space: nowrap;
`;

const ChatRobotButton = styled(Button)<{ $color: string }>`
    &:hover {
        background: ${({ $color }) => `${$color}15`};
    }
`;

const RobotAvatar = styled.span<{ $bg: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${({ $bg }) => $bg};
    color: #fff;
    font-size: 18px;
`;

const UserBadge = styled.button<{ $border: string }>`
    display: flex;
    align-items: center;
    padding: 4px 12px 4px 4px;
    border-radius: 999px;
    border: 1px solid ${({ $border }) => $border};
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
        background: rgba(0, 0, 0, 0.04);
    }
`;

const Avatar = styled.span<{ $bg: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${({ $bg }) => $bg};
    color: #fff;
    font-size: 13px;
    font-weight: 600;
`;

// 防止未使用变量警告(响应网络异常分支)
