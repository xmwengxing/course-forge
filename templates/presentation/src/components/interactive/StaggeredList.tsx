import { type ReactNode } from "react";
import "./StaggeredList.css";

export interface StaggeredItem {
  /** React 内容 */
  content: ReactNode;
  /** 可选的高亮颜色（--accent-tech / --accent-warn / --accent-deep） */
  highlight?: string;
}

interface StaggeredListProps {
  items: StaggeredItem[];
  /** step 控制几行可见（-1 全部不可见） */
  visible: boolean;
  /** 每行延迟秒数，默认 0.15 */
  delayPerRow?: number;
  /** 基础 CSS 前缀，默认 "sl" */
  prefix?: string;
  /** 在列表上方显示的标题（可选） */
  title?: string;
  /** 网格列数，默认 1（垂直列表），设为 2/3/4 则为网格 */
  columns?: number;
  /** 表头行标签（如 ['源', '目标', '风险']），如提供则第一行渲染为表头 */
  headers?: string[];
  /** 行数据（与 headers 配合使用），每行一个 string[] */
  rows?: string[][];
}

export default function StaggeredList({
  items, visible = true, delayPerRow = 0.15, prefix = "sl",
  title, columns, headers, rows,
}: StaggeredListProps) {
  return (
    <div className={`${prefix}-root`}>
      {title && <h3 className={`${prefix}-title`}>{title}</h3>}
      {headers && (
        <div className={`${prefix}-row ${prefix}-row--head`}>
          {headers.map((h, i) => <span key={i} className={`${prefix}-cell`}>{h}</span>)}
        </div>
      )}
      <div className={`${prefix}-body`} style={columns ? { display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 14 } : undefined}>
        {rows
          ? rows.map((row, ri) => (
              <div
                key={ri}
                className={`${prefix}-row ${visible && ri < 999 ? `${prefix}-row--visible` : ""}`}
                style={{ animationDelay: `${ri * delayPerRow}s` }}
              >
                {row.map((cell, ci) => <span key={ci} className={`${prefix}-cell`}>{cell}</span>)}
              </div>
            ))
          : items.map((it, i) => (
              <div
                key={i}
                className={`${prefix}-item ${visible && i < 999 ? `${prefix}-item--visible` : ""}`}
                style={{ animationDelay: `${i * delayPerRow}s` }}
              >
                {it.content}
              </div>
            ))}
      </div>
    </div>
  );
}
