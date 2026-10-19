"use client";

import { Button, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styled from "styled-components";
import TopNav from "@/components/top-nav";
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

    // 网络或服务异常:给出重试入口,而不是静默跳登录页
    if (authError) {
        return (
            <>
                <TopNav />
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
            </>
        );
    }

    if (loading || !initialized || !user) {
        return (
            <>
                <TopNav />
                <Centered>
                    <Spin size="large" />
                </Centered>
            </>
        );
    }

    return (
        <>
            <TopNav />
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
        </>
    );
}

const Centered = styled.div`
    min-height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Content = styled.div`
    padding: 32px;
    min-height: calc(100vh - 64px);
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
