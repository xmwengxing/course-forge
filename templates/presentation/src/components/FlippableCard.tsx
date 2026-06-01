import { useState, type ReactNode } from "react";

interface Props {
  front: ReactNode;
  back: ReactNode;
  /** click to flip; if not provided, the card is non-interactive */
  onClick?: () => void;
  className?: string;
  /** show back face initially (no flip needed) */
  defaultFlipped?: boolean;
  /** external control: if true, forces flipped state */
  flipped?: boolean;
}

/**
 * FlippableCard — click to flip between front / back faces.
 * 3D transform with backface-visibility:hidden. Used in S1 / S2 to let
 * students tap a card and reveal the "deeper" info (e.g. tap an ECRS
 * letter to see the full name + 中文).
 *
 * Marks with `data-no-advance` so clicking it doesn't advance the chapter.
 */
export function FlippableCard({
  front,
  back,
  onClick,
  className,
  defaultFlipped = false,
  flipped,
}: Props) {
  const [internal, setInternal] = useState(defaultFlipped);
  const isFlipped = flipped ?? internal;

  return (
    <div
      className={`flippable-card ${isFlipped ? "is-flipped" : ""} ${className ?? ""}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
        else setInternal(!internal);
      }}
      data-no-advance
    >
      <div className="flippable-card-inner">
        <div className="flippable-card-face flippable-card-front">{front}</div>
        <div className="flippable-card-face flippable-card-back">{back}</div>
      </div>
    </div>
  );
}
