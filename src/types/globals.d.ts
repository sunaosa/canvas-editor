// This file allows CSS imports in TypeScript
declare module "*.css" {
    const css: string;
    export default css;
}

import "styled-components";
import type { StudioTheme } from "@/app/theme-provider";

// 让 styled-components 的样式可以直接读取设计令牌：props.theme.colors.ink
declare module "styled-components" {
    export interface DefaultTheme extends StudioTheme {}
}
