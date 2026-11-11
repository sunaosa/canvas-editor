import Link from "next/link";
import type { ReactNode } from "react";
import styled, { keyframes } from "styled-components";
import { useTheme } from "@/app/theme-provider";
import { EraserIcon, MoonIcon, PenIcon, SparkIcon, SunIcon } from "./icons";
import { LogoMark } from "./logo";
import { IconButton } from "./ui";

/**
 * 登录 / 注册共用的版式：
 * 左侧是一张画在桌面上的图纸（记忆点：落笔的那一笔），
 * 右侧是表单，不使用卡片和阴影，只靠细线与留白分区。
 */
export function AuthShell({
    title,
    description,
    children,
    footer,
}: {
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
}) {
    const { theme, toggleTheme } = useTheme();

    return (
        <Shell>
            <Hero>
                <Paper>
                    <Brand>
                        <LogoMark />
                        <BrandName>Canvas Editor</BrandName>
                    </Brand>

                    <Sketch
                        viewBox="0 0 520 300"
                        role="img"
                        aria-label="一支笔在图纸上划出的墨迹"
                    >
                        <StrokeA
                            d="M30 214C90 96 150 244 226 150s124 36 194-30c32-28 56-20 74-28"
                            pathLength={1}
                            stroke={theme.colors.ink}
                            strokeWidth={7}
                        />
                        <StrokeB
                            d="M30 252c80 36 170-34 262 4s148-12 202-36"
                            pathLength={1}
                            stroke={theme.colors.accent}
                            strokeWidth={3}
                        />
                        <InkDot
                            cx={494}
                            cy={92}
                            r={5}
                            fill={theme.colors.accent}
                        />
                    </Sketch>

                    <Headline>把想法画下来</Headline>
                    <Lead>
                        一张图纸、随手可换的画笔，还有随时能问的 AI
                        助手。登录之后就能开始画。
                    </Lead>

                    <Capabilities>
                        <Capability>
                            <CapabilityIcon>
                                <PenIcon size={18} />
                            </CapabilityIcon>
                            <CapabilityTitle>手绘板</CapabilityTitle>
                            <CapabilityText>
                                多色画笔与橡皮，笔尖 1–40px
                            </CapabilityText>
                        </Capability>
                        <Capability>
                            <CapabilityIcon>
                                <EraserIcon size={18} />
                            </CapabilityIcon>
                            <CapabilityTitle>可回退</CapabilityTitle>
                            <CapabilityText>
                                Ctrl+Z 撤销，一键导出 PNG
                            </CapabilityText>
                        </Capability>
                        <Capability>
                            <CapabilityIcon>
                                <SparkIcon size={18} />
                            </CapabilityIcon>
                            <CapabilityTitle>AI 助手</CapabilityTitle>
                            <CapabilityText>
                                登录后与 AI 对话聊构图
                            </CapabilityText>
                        </Capability>
                    </Capabilities>

                    <Seal aria-hidden="true">画</Seal>
                </Paper>
            </Hero>

            <Aside>
                <AsideTop>
                    <BackLink href="/">返回工作台</BackLink>
                    <IconButton
                        $size={34}
                        aria-label={
                            theme.darkMode ? "切换到浅色模式" : "切换到深色模式"
                        }
                        onClick={toggleTheme}
                    >
                        {theme.darkMode ? (
                            <SunIcon size={18} />
                        ) : (
                            <MoonIcon size={18} />
                        )}
                    </IconButton>
                </AsideTop>

                <FormArea>
                    <FormTitle>{title}</FormTitle>
                    <FormDesc>{description}</FormDesc>
                    {children}
                    {footer ? <FormFooter>{footer}</FormFooter> : null}
                </FormArea>
            </Aside>
        </Shell>
    );
}

const Shell = styled.div`
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(380px, 0.92fr);
    background: ${({ theme }) => theme.colors.board};

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const Hero = styled.section`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 36px;
    background: ${({ theme }) => theme.colors.boardDeep};

    @media (max-width: 980px) {
        padding: 20px 16px 0;
        align-items: flex-start;
    }
`;

const Paper = styled.div`
    position: relative;
    width: 100%;
    max-width: 640px;
    padding: 36px 44px 40px;
    border-radius: 10px;
    background-color: ${({ theme }) => theme.colors.sheet};
    background-image:
        linear-gradient(
            to right,
            ${({ theme }) => theme.colors.grid} 1px,
            transparent 1px
        ),
        linear-gradient(
            to bottom,
            ${({ theme }) => theme.colors.grid} 1px,
            transparent 1px
        ),
        linear-gradient(
            to right,
            ${({ theme }) => theme.colors.gridStrong} 1px,
            transparent 1px
        ),
        linear-gradient(
            to bottom,
            ${({ theme }) => theme.colors.gridStrong} 1px,
            transparent 1px
        );
    background-size:
        24px 24px,
        24px 24px,
        120px 120px,
        120px 120px;
    box-shadow: ${({ theme }) => theme.colors.shadow};
    overflow: hidden;

    @media (max-width: 980px) {
        padding: 24px 22px 26px;
    }
`;

const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
`;

const BrandName = styled.span`
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.ink};
`;

const Sketch = styled.svg`
    display: block;
    width: 100%;
    height: auto;
    margin-bottom: 26px;

    @media (max-width: 980px) {
        max-width: 420px;
    }
`;

const draw = keyframes`
    from {
        stroke-dashoffset: 1;
    }
    to {
        stroke-dashoffset: 0;
    }
`;

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0.4);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
`;

const StrokeA = styled.path`
    fill: none;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: ${draw} 1.9s cubic-bezier(0.65, 0, 0.35, 1) 0.15s forwards;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        stroke-dashoffset: 0;
    }
`;

const StrokeB = styled.path`
    fill: none;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: ${draw} 1.5s cubic-bezier(0.65, 0, 0.35, 1) 1.15s forwards;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        stroke-dashoffset: 0;
    }
`;

const InkDot = styled.circle`
    opacity: 0;
    transform-origin: 494px 92px;
    animation: ${fadeIn} 0.4s ease 1.75s forwards;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 1;
    }
`;

const Headline = styled.h1`
    margin: 0 0 10px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 34px;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.ink};

    @media (max-width: 980px) {
        font-size: 26px;
    }
`;

const Lead = styled.p`
    margin: 0;
    max-width: 44ch;
    font-size: 14.5px;
    line-height: 1.75;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const Capabilities = styled.ul`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    margin: 30px 0 0;
    padding: 22px 0 0;
    list-style: none;
    border-top: 1px solid ${({ theme }) => theme.colors.rule};

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: 14px;
    }

    @media (max-width: 980px) {
        display: none;
    }
`;

const Capability = styled.li`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 2px;
`;

const CapabilityIcon = styled.span`
    grid-row: 1 / span 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
`;

const CapabilityTitle = styled.span`
    font-size: 13.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ink};
`;

const CapabilityText = styled.span`
    font-size: 12.5px;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const Seal = styled.span`
    position: absolute;
    right: 26px;
    bottom: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1.5px solid ${({ theme }) => theme.colors.accent};
    border-radius: 5px;
    transform: rotate(-7deg);
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 19px;
    color: ${({ theme }) => theme.colors.accent};
    opacity: 0.9;
`;

const Aside = styled.aside`
    display: flex;
    flex-direction: column;
    padding: 30px 44px 40px;
    background: ${({ theme }) => theme.colors.board};

    @media (max-width: 980px) {
        padding: 20px 20px 44px;
    }
`;

const AsideTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
`;

const BackLink = styled(Link)`
    font-size: 13px;
    color: ${({ theme }) => theme.colors.inkSoft};
    text-decoration: none;

    &:hover {
        color: ${({ theme }) => theme.colors.ink};
    }
`;

const FormArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 380px;
    margin: 0 auto;
`;

const FormTitle = styled.h2`
    margin: 0 0 6px;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 26px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ink};
`;

const FormDesc = styled.p`
    margin: 0 0 26px;
    font-size: 13.5px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.inkSoft};
`;

const FormFooter = styled.div`
    margin-top: 22px;
    padding-top: 20px;
    border-top: 1px solid ${({ theme }) => theme.colors.rule};
    font-size: 13.5px;
    color: ${({ theme }) => theme.colors.inkSoft};
`;
