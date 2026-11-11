"use client";

import { Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styled from "styled-components";
import { SparkIcon } from "@/components/icons";
import TopNav from "@/components/top-nav";
import { useAuthStore } from "@/store/auth-store";

export default function ChatPage() {
    const router = useRouter();

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
                    <Panel>
                        <PanelTitle>无法获取用户信息</PanelTitle>
                        <PanelText>网络或服务异常，请稍后重试。</PanelText>
                        <RetryButton type="primary" onClick={() => fetchMe()}>
                            重试
                        </RetryButton>
                    </Panel>
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
                <Panel>
                    <PanelIcon>
                        <SparkIcon size={22} />
                    </PanelIcon>
                    <PanelTitle>
                        欢迎，{user.displayName || user.username}
                    </PanelTitle>
                    <PanelText>AI 对话还在准备中，先回画板落两笔？</PanelText>

                    <InfoList>
                        <InfoRow>
                            <InfoLabel>邮箱</InfoLabel>
                            <InfoValue>{user.email || "未设置"}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>用户 ID</InfoLabel>
                            <InfoValue>{user.uuid}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>注册于</InfoLabel>
                            <InfoValue>
                                {new Date(user.createdAt).toLocaleDateString(
                                    "zh-CN",
                                )}
                            </InfoValue>
                        </InfoRow>
                    </InfoList>

                    <BackLink onClick={() => router.push("/")}>
                        回到画板
                    </BackLink>
                </Panel>
            </Content>
        </>
    );
}

const Centered = styled.div`
    min-height: calc(100vh - 56px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
`;

const Content = styled.div`
    min-height: calc(100vh - 56px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: ${({ theme }) => theme.colors.boardDeep};
`;

const Panel = styled.div`
    width: 100%;
    max-width: 460px;
    padding: 32px;
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.sheet};
    border: 1px solid ${({ theme }) => theme.colors.rule};
    box-shadow: ${({ theme }) => theme.colors.shadow};
`;

const PanelIcon = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    margin-bottom: 16px;
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accent};
`;

const PanelTitle = styled.h2`
    margin: 0 0 6px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 21px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ink};
`;

const PanelText = styled.p`
    margin: 0 0 20px;
    font-size: 13.5px;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const RetryButton = styled(Button)`
    && {
        border-radius: 6px;
    }
`;

const InfoList = styled.dl`
    display: flex;
    flex-direction: column;
    margin: 0 0 22px;
    padding: 16px 0;
    border-top: 1px solid ${({ theme }) => theme.colors.rule};
    border-bottom: 1px solid ${({ theme }) => theme.colors.rule};
`;

const InfoRow = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    padding: 5px 0;
`;

const InfoLabel = styled.dt`
    font-size: 12px;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const InfoValue = styled.dd`
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 12.5px;
    color: ${({ theme }) => theme.colors.ink};
    text-align: right;
    word-break: break-all;
`;

const BackLink = styled.button.attrs({ type: "button" })`
    padding: 0;
    border: 0;
    background: none;
    font-size: 13.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;
