import { useState, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: Tab[];
  /** which tab is currently selected (controlled); if omitted, internal state */
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

/**
 * TabSwitcher — click a tab pill to reveal its content panel below.
 * All panels mount in DOM (no re-render) so animation states don't reset.
 * Each tab gets a small "is-active" pulse; active tab has accent color.
 *
 * Marks with `data-no-advance` so clicking tabs doesn't advance the chapter.
 */
export function TabSwitcher({
  tabs,
  activeId,
  defaultActiveId,
  onChange,
  className,
}: Props) {
  const [internal, setInternal] = useState(defaultActiveId ?? tabs[0]?.id);
  const current = activeId ?? internal;

  return (
    <div className={`tab-switcher ${className ?? ""}`} data-no-advance>
      <div className="tab-switcher-pills">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-pill ${current === t.id ? "is-active" : ""}`}
            onClick={() => {
              setInternal(t.id);
              onChange?.(t.id);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-switcher-panels">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`tab-panel ${current === t.id ? "is-active" : ""}`}
            aria-hidden={current !== t.id}
          >
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
