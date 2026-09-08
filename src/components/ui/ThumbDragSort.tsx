"use client";

import { useState } from "react";
import type { Ratings } from "@/lib/matching";

type Item = { recId: number; text: string };
type Zone = "up" | "down";

type ThumbDragSortProps = {
  items: Item[];
  ratings: Ratings;
  onRate: (recId: number, value: boolean) => void;
  onUnrate: (recId: number) => void;
  // Most-recently-sorted id is last. Owned by the parent so the same recency
  // order can be reused on the later "pick the 2 strongest/weakest" review
  // steps — otherwise those steps list items back in suggestions.ts order,
  // which doesn't match the order the participant just saw them sorted into.
  order: number[];
  onOrderChange: (order: number[]) => void;
};

export default function ThumbDragSort({ items, ratings, onRate, onUnrate, order, onOrderChange }: ThumbDragSortProps) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overZone, setOverZone] = useState<Zone | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const byId = (id: number) => items.find((it) => it.recId === id)!;
  const queue = items.filter((it) => ratings[it.recId] === undefined);
  const current = queue[0] ?? null;
  const sortedByRecency = (value: boolean) =>
    order
      .filter((id) => ratings[id] === value)
      .reverse()
      .map(byId);
  const upItems = sortedByRecency(true);
  const downItems = sortedByRecency(false);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, id: number) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setPos({ x: e.clientX, y: e.clientY });
    setDragId(id);
    card.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragId === null) return;
    setPos({ x: e.clientX, y: e.clientY });
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const zoneEl = el?.closest<HTMLElement>("[data-dropzone]");
    setOverZone((zoneEl?.dataset.dropzone as Zone) ?? null);
  }

  function handlePointerUp() {
    if (dragId === null) return;
    const id = dragId;
    const zone = overZone;
    setDragId(null);
    setOverZone(null);
    if (zone === "up" || zone === "down") {
      onRate(id, zone === "up");
      onOrderChange([...order.filter((x) => x !== id), id]);
    } else {
      onUnrate(id);
      onOrderChange(order.filter((x) => x !== id));
    }
  }

  function handleUndo(id: number) {
    onUnrate(id);
    onOrderChange(order.filter((x) => x !== id));
  }

  return (
    <div
      className="drag-sort"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {current && (
        <div className="drag-queue">
          <div
            className={`drag-card current ${dragId === current.recId ? "dragging" : ""}`}
            onPointerDown={(e) => handlePointerDown(e, current.recId)}
          >
            <span className="sugg-text">{current.text}</span>
          </div>
        </div>
      )}

      <div className="drag-buckets">
        <div className={`drag-bucket up ${overZone === "up" ? "over" : ""}`} data-dropzone="up">
          <div className="bucket-label">
            <span className="bucket-icon">👍</span> Agree <span className="bucket-count">{upItems.length}</span>
          </div>
          <div className="bucket-pile">
            {upItems.map((it) => (
              <div
                className={`pile-card ${dragId === it.recId ? "dragging" : ""}`}
                key={it.recId}
                onPointerDown={(e) => handlePointerDown(e, it.recId)}
              >
                <span className="sugg-text">{it.text}</span>
                <button
                  type="button"
                  className="pile-undo"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleUndo(it.recId)}
                  aria-label="Move back to queue"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className={`drag-bucket down ${overZone === "down" ? "over" : ""}`} data-dropzone="down">
          <div className="bucket-label">
            <span className="bucket-icon">👎</span> Disagree <span className="bucket-count">{downItems.length}</span>
          </div>
          <div className="bucket-pile">
            {downItems.map((it) => (
              <div
                className={`pile-card ${dragId === it.recId ? "dragging" : ""}`}
                key={it.recId}
                onPointerDown={(e) => handlePointerDown(e, it.recId)}
              >
                <span className="sugg-text">{it.text}</span>
                <button
                  type="button"
                  className="pile-undo"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleUndo(it.recId)}
                  aria-label="Move back to queue"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {dragId !== null && (
        <div className="drag-ghost" style={{ left: pos.x - offset.x, top: pos.y - offset.y }}>
          <span className="sugg-text">{byId(dragId).text}</span>
        </div>
      )}
    </div>
  );
}
