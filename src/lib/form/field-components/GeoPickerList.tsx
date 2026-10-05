// React
import { useEffect, useMemo, useRef, useState } from "react";

// Virtual
import { useVirtualizer } from "@tanstack/react-virtual";

// UI Components
import { Input } from "@/components/ui/input";

// Icons
import { Plus, SearchIcon, SearchX } from "lucide-react";

// Types
import type { GeoOption } from "@/lib/geo";

// Utils
import { cn } from "@/lib/utils";

interface GeoPickerListProps {
  options: GeoOption[];
  value: string;
  onSelect: (value: string) => void;
  searchPlaceholder?: string;
  notFoundMessage?: string;
  /**
   * When set, typing a value that matches nothing offers a "use this" row
   * that selects the raw query. Used for cities the dataset does not know.
   */
  allowCustom?: boolean;
  /** Max height of the scrollable rows area, px (desktop popover). */
  listHeight?: number;
  /** Row height, px. Taller on touch surfaces. */
  rowHeight?: number;
  /** Auto focus the search box (desktop only; on mobile it pops the keyboard). */
  autoFocusSearch?: boolean;
  showFooter?: boolean;
  /**
   * Fill the parent's remaining height (mobile drawer, which has a definite
   * height) instead of sizing to `listHeight`.
   */
  fillHeight?: boolean;
  className?: string;
}

/**
 * Searchable, virtualized option list shared by the desktop popover and the
 * mobile drawer of GeoSelectField. Country/state/city datasets run up to
 * ~2.9k rows, so rendering is windowed and every keystroke only filters.
 */
export function GeoPickerList({
  options,
  value,
  onSelect,
  searchPlaceholder = "Search...",
  notFoundMessage = "No matches found",
  allowCustom = false,
  listHeight = 320,
  rowHeight = 44,
  autoFocusSearch = true,
  showFooter = false,
  fillHeight = false,
  className,
}: GeoPickerListProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listId = useRef(`geo-list-${Math.random().toString(36).slice(2, 8)}`);

  const trimmed = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!trimmed) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(trimmed) ||
        option.hint?.toLowerCase().includes(trimmed)
    );
  }, [options, trimmed]);

  // The custom entry row is index 0 whenever it is shown; dataset rows follow.
  const showCustom =
    allowCustom && !!trimmed && !filtered.some((o) => o.label.toLowerCase() === trimmed);
  const rowCount = filtered.length + (showCustom ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  // Open on the current selection so switching a long list does not start
  // from the top (matters for the ~2.9k-row England city list).
  useEffect(() => {
    if (!value || trimmed) return;
    const index = filtered.findIndex((o) => o.value === value);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => setActiveIndex(-1), [trimmed]);

  const scrollActiveIntoView = (index: number) => {
    const rowIndex = showCustom ? index - 1 : index;
    if (rowIndex >= 0) virtualizer.scrollToIndex(rowIndex, { align: "auto" });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (rowCount === 0) return;
      setActiveIndex((prev) => {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const next = prev < 0 ? (event.key === "ArrowDown" ? 0 : rowCount - 1) : prev + delta;
        const clamped = (next + rowCount) % rowCount;
        scrollActiveIntoView(clamped);
        return clamped;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex === 0 && showCustom) {
        onSelect(query.trim());
        return;
      }
      const option = filtered[showCustom ? activeIndex - 1 : activeIndex];
      if (option) onSelect(option.value);
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {/* Search: sticky header outside the scroll area so it never scrolls
          away, with the result count in the footer as quiet confirmation. */}
      <div className="relative shrink-0 border-b">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={searchPlaceholder}
          autoFocus={autoFocusSearch}
          aria-controls={listId.current}
          className="[&_input]:ps-10 [&_input]:border-0 [&_input]:shadow-none rounded-b-none border-x-0 border-t-0 focus-visible:ring-0 sm:h-9"
        />
      </div>

      <div
        ref={scrollRef}
        role="listbox"
        id={listId.current}
        aria-label={searchPlaceholder}
        className={cn(
          "min-h-0 overflow-y-auto overflow-x-hidden p-1.5 [scrollbar-width:thin]",
          fillHeight && "flex-1",
        )}
        style={
          fillHeight
            ? undefined
            : { height: rowCount === 0 ? 180 : Math.min(listHeight, rowCount * rowHeight + 12) }
        }
      >
        {showCustom && (
          <PickerRow
            rowHeight={rowHeight}
            active={activeIndex === 0}
            onHover={() => setActiveIndex(0)}
            onClick={() => onSelect(query.trim())}
            icon={<Plus className="size-4 text-primary" aria-hidden="true" />}
            label={query.trim()}
            hint="Not listed? Use this"
          />
        )}

        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const option = filtered[virtualRow.index];
            const combinedIndex = virtualRow.index + (showCustom ? 1 : 0);
            const isSelected = option.value === value;
            return (
              <PickerRow
                key={option.value}
                rowHeight={rowHeight}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                active={activeIndex === combinedIndex}
                selected={isSelected}
                onHover={() => setActiveIndex(combinedIndex)}
                onClick={() => onSelect(option.value)}
                label={option.label}
                hint={option.hint}
              />
            );
          })}
        </div>

        {rowCount === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <SearchX className="size-5 text-muted-foreground/60" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              {trimmed ? notFoundMessage : notFoundMessage}
            </p>
          </div>
        )}
      </div>

      {showFooter && (
        <div className="shrink-0 border-t px-3.5 py-2 text-xs text-muted-foreground">
          {trimmed
            ? `${filtered.length} match${filtered.length === 1 ? "" : "es"}`
            : `${options.length} options`}
        </div>
      )}
    </div>
  );
}

interface PickerRowProps {
  rowHeight: number;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  active?: boolean;
  /** The row is the currently selected value: tint + check. */
  selected?: boolean;
  onHover?: () => void;
  onClick: () => void;
  style?: React.CSSProperties;
}

function PickerRow({
  rowHeight,
  label,
  hint,
  icon,
  active,
  selected,
  onHover,
  onClick,
  style,
}: PickerRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected || undefined}
      tabIndex={-1}
      onMouseEnter={onHover}
      onClick={onClick}
      style={{ height: rowHeight, ...style }}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 text-left text-sm outline-none transition-colors duration-75",
        "data-[active=true]:bg-accent",
        active && "bg-accent",
        selected && "text-primary",
      )}
      data-active={active || undefined}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {selected && (
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12.5 10 18 19 6.5" />
        </svg>
      )}
      {hint && !selected && (
        <span className="shrink-0 text-xs text-muted-foreground/70">{hint}</span>
      )}
    </button>
  );
}
