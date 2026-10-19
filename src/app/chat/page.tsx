"use client";

import { Button, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styled from "styled-components";
import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "../theme-provider";

const { Text, Title } = Typography;

export default function ChatPage() {
    const router = useRouter();
    const { theme } = useTheme();

    const user = useAuthStore((s) => s.user);
    const loading = useAuthStore((s) => s.loading);
    const initialized = useAuthStore((s) => s.initialized);
    const authError = useAuthStore((s) => s.authError);
    const fetchMe = useAuthStore((s) => s.fetchMe);
    const logout = useAuthStore((s) => s.logout);

    // 进入页面时拉取用户信息
    useEffect(() => {
        if (!initialized) {
            fetchMe();
        }
    }, [initialized, fetchMe]);

    // 拉取完成后若未登录，跳转登录页(服务异常时不跳,避免把故障误判成未登录)
    useEffect(() => {
        if (initialized && !user && !authError) {
            router.push("/login?redirect=/chat");
        }
    }, [initialized, user, authError, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    // 网络或服务异常:给出重试入口,而不是静默跳登录页
    if (authError) {
        return (
            <Centered>
                <EmptyCard
                    $darkMode={theme.darkMode}
                    style={{ backgroundColor: theme.colors.card }}
                >
                    <Title level={4} style={{ color: theme.colors.text }}>
                        无法获取用户信息
                    </Title>
                    <Text style={{ color: theme.colors.textSecondary }}>
                        网络或服务异常，请稍后重试
                    </Text>
                    <br />
                    <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={() => fetchMe()}
                    >
                        重试
                    </Button>
                </EmptyCard>
            </Centered>
        );
    }

    if (loading || !initialized || !user) {
        return (
            <Centered>
                <Spin size="large" />
            </Centered>
        );
    }

    return (
        <Container>
            <Header>
                <Title
                    level={3}
                    style={{ color: theme.colors.text, margin: 0 }}
                >
                    Canvas Editor - 对话
                </Title>
                <UserArea>
                    <Text style={{ color: theme.colors.textSecondary }}>
                        {user.displayName || user.username}
                    </Text>
                    <Button onClick={handleLogout} danger size="small">
                        退出登录
                    </Button>
                </UserArea>
            </Header>

            <Content>
                <EmptyCard
                    $darkMode={theme.darkMode}
                    style={{ backgroundColor: theme.colors.card }}
                >
                    <Title level={4} style={{ color: theme.colors.text }}>
                        欢迎，{user.displayName || user.username} 👋
                    </Title>
                    <Text style={{ color: theme.colors.textSecondary }}>
                        UUID: {user.uuid}
                    </Text>
                    <br />
                    <Text style={{ color: theme.colors.textSecondary }}>
                        邮箱: {user.email || "未设置"}
                    </Text>
                </EmptyCard>
            </Content>
        </Container>
    );
}

const Centered = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const UserArea = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const Content = styled.div`
    flex: 1;
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const EmptyCard = styled.div<{ $darkMode?: boolean }>`
    padding: 48px;
    border-radius: 16px;
    text-align: center;
    box-shadow: ${({ $darkMode }) =>
        $darkMode
            ? "0 10px 30px rgba(0, 0, 0, 0.4)"
            : "0 10px 30px rgba(0, 0, 0, 0.1)"};
`;
