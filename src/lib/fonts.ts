/**
 * 字体栈
 * - display: DIN 骨架的工业无衬线，用于标题与品牌字
 * - body: 系统 UI 无衬线，保证中文阅读舒适
 * - mono: 数值读数（坐标、尺寸、笔尖粗细）
 *
 * 全部使用系统字体，不依赖网络下载，离线可用。
 */
export const fontDisplay =
    '"Bahnschrift", "DIN Alternate", "Segoe UI Variable Display", "PingFang SC", "Microsoft YaHei UI", system-ui, sans-serif';

export const fontBody =
    '"Segoe UI Variable Text", "Segoe UI", -apple-system, "PingFang SC", "Microsoft YaHei UI", system-ui, sans-serif';

export const fontMono =
    '"Cascadia Mono", "Cascadia Code", Consolas, "SF Mono", ui-monospace, "Microsoft YaHei UI", monospace';
