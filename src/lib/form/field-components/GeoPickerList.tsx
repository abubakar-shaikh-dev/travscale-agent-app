// React
import { useEffect, useMemo, useRef, useState } from "react";

// Virtual
import { useVirtualizer } from "@tanstack/react-virtual";

// UI Components
import { Input } from "@/components/ui/input";

// Icons
import { Check, SearchIcon, SearchX, X } from "lucide-react";

// Types
import type { GeoOption } from "@/lib/geo";

// Utils
import { cn } from "@/lib/utils";

/**
 * Presentation surface of the picker. `variant="popover"` is the desktop
 * dropdown (full-bleed search bar on a hairline border); `variant="sheet"`
 * is the mobile bottom sheet (filled, rounded search field with a 44px
 * touch target, content-height list capped to the viewport).
 */
type GeoPickerVariant = "popover" | "sheet";

interface GeoPickerListProps {
  options: GeoOption[];
  value: string;
  onSelect: (value: string) => void;
  searchPlaceholder?: string;
  notFoundMessage?: string;
  /** Max height of the scrollable rows area, px. */
  listHeight?: number;
  /** Row height, px. Taller on touch surfaces. */
  rowHeight?: number;
  /** Auto focus the search box (desktop only; on mobile it pops the keyboard). */
  autoFocusSearch?: boolean;
  showFooter?: boolean;
  variant?: GeoPickerVariant;
  /**
   * Optional quick-pick items rendered as compact chips between the search
   * and the list while no search is active. The section renders only when
   * provided; generic datasets never see it.
   */
  popularItems?: GeoOption[];
  /**
   * Optional leading visual per row (flag, avatar, icon). When omitted, rows
   * render without reserved leading space.
   */
  renderLeading?: (option: GeoOption) => React.ReactNode;
  /**
   * Groups the idle list under subtle section headers (first letter for
   * geo datasets). While searching, results render flat: matches are few
   * and headers only push them apart.
   */
  groupBy?: (option: GeoOption) => string;
  /** Letter strip on the trailing edge that jumps to a section (touch). */
  alphabetIndex?: boolean;
  className?: string;
}

interface HeaderRow {
  kind: "header";
  id: string;
  label: string;
}

interface OptionRow {
  kind: "option";
  id: string;
  option: GeoOption;
  /** Index of the option within `filtered` (keyboard navigation space). */
  optionIndex: number;
}

type ListRow = HeaderRow | OptionRow;

const HEADER_ROW_HEIGHT = 34;

/**
 * Searchable, virtualized option list shared by the desktop popover and the
 * mobile sheet. Country/state/city datasets run up to ~2.9k rows, so
 * rendering is windowed and every keystroke only filters. Search matches
 * against the label and the hint, so codes and aliases find their rows
 * ("IN" finds India).
 */
export function GeoPickerList({
  options,
  value,
  onSelect,
  searchPlaceholder = "Search...",
  notFoundMessage = "No matches found",
  listHeight = 320,
  rowHeight = 44,
  autoFocusSearch = true,
  showFooter = false,
  variant = "popover",
  popularItems,
  renderLeading,
  groupBy,
  alphabetIndex = false,
  className,
}: GeoPickerListProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listId = useRef(`geo-list-${Math.random().toString(36).slice(2, 8)}`);

  const isSheet = variant === "sheet";

  const trimmed = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!trimmed) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(trimmed) ||
        option.hint?.toLowerCase().includes(trimmed)
    );
  }, [options, trimmed]);

  const optionCount = filtered.length;

  // Idle grouped rows (section headers between them), or flat rows while
  // searching. `rowIndexByOption` maps a keyboard/option index onto its row.
  const { rows, rowIndexByOption } = useMemo(() => {
    if (trimmed || !groupBy) {
      return {
        rows: filtered.map<OptionRow>((option, optionIndex) => ({
          kind: "option",
          id: option.value,
          option,
          optionIndex,
        })),
        rowIndexByOption: filtered.map((_, optionIndex) => optionIndex),
      };
    }

    const groups = new Map<string, GeoOption[]>();
    for (const option of filtered) {
      const key = groupBy(option);
      const bucket = groups.get(key);
      if (bucket) bucket.push(option);
      else groups.set(key, [option]);
    }

    const groupedRows: ListRow[] = [];
    const optionRows: number[] = [];
    for (const key of [...groups.keys()].sort((a, b) => a.localeCompare(b))) {
      groupedRows.push({ kind: "header", id: `header-${key}`, label: key });
      for (const option of groups.get(key)!) {
        optionRows.push(groupedRows.length);
        groupedRows.push({
          kind: "option",
          id: option.value,
          option,
          optionIndex: optionRows.length - 1,
        });
      }
    }
    return { rows: groupedRows, rowIndexByOption: optionRows };
  }, [filtered, trimmed, groupBy]);

  const rowsHeight = rows.reduce(
    (total, row) => total + (row.kind === "header" ? HEADER_ROW_HEIGHT : rowHeight),
    0
  );
  // A short dataset sizes the surface to its content; a long one caps at
  // listHeight (and, on the sheet, to a share of the viewport).
  const listHeightPx =
    rows.length === 0 ? 180 : Math.min(listHeight, rowsHeight + 12);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index]?.kind === "header" ? HEADER_ROW_HEIGHT : rowHeight,
    overscan: 10,
  });

  // Open on the current selection so switching a long list does not start
  // from the top (matters for the ~2.9k-row England city list).
  useEffect(() => {
    if (!value || trimmed) return;
    const optionIndex = filtered.findIndex((o) => o.value === value);
    const rowIndex = optionIndex >= 0 ? rowIndexByOption[optionIndex] : -1;
    if (rowIndex >= 0) virtualizer.scrollToIndex(rowIndex, { align: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => setActiveIndex(-1), [trimmed]);

  const scrollActiveIntoView = (index: number) => {
    const rowIndex = rowIndexByOption[index];
    if (rowIndex >= 0) virtualizer.scrollToIndex(rowIndex, { align: "auto" });
  };

  /** Empty the box without dropping keyboard focus from the search. */
  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && query) {
      // Command-menu pattern: the first Escape empties the box and stays in
      // the picker; Escape-to-close applies only once it is already empty.
      event.preventDefault();
      event.stopPropagation();
      clearQuery();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (optionCount === 0) return;
      setActiveIndex((prev) => {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const next = prev < 0 ? (event.key === "ArrowDown" ? 0 : optionCount - 1) : prev + delta;
        const clamped = (next + optionCount) % optionCount;
        scrollActiveIntoView(clamped);
        return clamped;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      // Enter before any arrow navigation takes the top match (command-menu
      // behavior): typing a full name then Enter should commit it.
      const option =
        activeIndex >= 0 ? filtered[activeIndex] : (filtered[0] ?? undefined);
      if (option) onSelect(option.value);
    }
  };

  const showPopular = !trimmed && !!popularItems?.length && optionCount > 0;
  const headerCount = rows.reduce(
    (count, row) => count + (row.kind === "header" ? 1 : 0),
    0,
  );
  // The strip earns its width only with several sections to jump between.
  const showIndexStrip = alphabetIndex && !trimmed && headerCount > 1;
  const indexLetters = rows.filter(
    (row): row is HeaderRow => row.kind === "header"
  );

  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
      {/* Search + quick picks: one Apple-style header block. The field is an
          inset filled surface with a magnifier and a disc "x" that appears
          while typing; a single hairline separates the block from the list
          on the popover. The sheet relies on spacing alone. */}
      <div className={cn("shrink-0", !isSheet && "border-b")}>
        <div className={cn(isSheet ? "px-4 pb-3 pt-1" : "px-2 pb-2 pt-2")}>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              autoFocus={autoFocusSearch}
              aria-controls={listId.current}
              className={cn(
                "rounded-lg border-0 bg-muted shadow-none focus-visible:ring-ring/20 focus-within:ring-ring/20",
                "[&_input]:bg-transparent [&_input]:ps-10 [&_input]:border-0 [&_input]:shadow-none",
                isSheet
                  ? "[&_input]:h-11 [&_input]:leading-11"
                  : "[&_input]:h-9 [&_input]:leading-9",
                query && "[&_input]:pe-10",
                isSheet &&
                  "focus-visible:ring-[3px] focus-within:ring-[3px] focus-within:transition-colors",
              )}
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Clear search"
                className="absolute top-1/2 end-2 flex size-[18px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-foreground/25 text-background outline-none transition-colors duration-100 hover:bg-foreground/40 active:bg-foreground/35 focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-2"
              >
                <X className="size-2.5" strokeWidth={3.5} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Popular quick picks: filled capsules, never cards. Hidden while
            searching so results own the space. */}
        {showPopular && popularItems && (
          <div className={cn(isSheet ? "px-4 pb-2" : "px-2 pb-2")}>
            <p
              className={cn(
                "pb-1.5 text-[13px] font-normal text-muted-foreground",
                isSheet ? "px-1" : "px-1.5",
              )}
            >
              Popular
            </p>
            <div className="flex flex-wrap gap-1.5">
              {popularItems.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSelect(option.value)}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-foreground/8 active:bg-foreground/12",
                    )}
                  >
                    {renderLeading?.(option)}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* The list surface: content-sized up to listHeight, shrinking under
          a viewport cap so the popover never flips to the screen edge. */}
      <div
        className="relative min-h-0"
        style={
          isSheet
            ? { height: `min(${listHeightPx}px, 55dvh)` }
            : { height: listHeightPx }
        }
      >
        <div
          ref={scrollRef}
          role="listbox"
          id={listId.current}
          aria-label={searchPlaceholder}
          className={cn(
            "h-full overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:thin]",
            showIndexStrip && "pe-6",
          )}
        >
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (row.kind === "header") {
                return (
                  <div
                    key={row.id}
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-0 flex w-full items-end pb-1 text-[13px] font-normal text-muted-foreground",
                      isSheet ? "px-4" : "px-3",
                    )}
                    style={{
                      height: HEADER_ROW_HEIGHT,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.label}
                  </div>
                );
              }
              const option = row.option;
              const isSelected = option.value === value;
              return (
                <PickerRow
                  key={row.id}
                  rowHeight={rowHeight}
                  variant={variant}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  active={activeIndex === row.optionIndex}
                  selected={isSelected}
                  onHover={() => setActiveIndex(row.optionIndex)}
                  onClick={() => onSelect(option.value)}
                  leading={renderLeading?.(option)}
                  label={option.label}
                  secondary={option.secondary}
                  hint={option.hint}
                />
              );
            })}
          </div>

          {optionCount === 0 && (
            <div className="flex flex-col items-center gap-1.5 px-4 py-9 text-center">
              <SearchX className="size-5 text-muted-foreground/60" aria-hidden="true" />
              <p className="text-sm font-medium">{notFoundMessage}</p>
              {trimmed && (
                <p className="text-xs text-muted-foreground">
                  Nothing matches “{query.trim()}”.
                </p>
              )}
              {trimmed && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="mt-1 inline-flex h-9 cursor-pointer items-center rounded-md px-3 text-sm font-medium text-primary outline-none transition-colors duration-100 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:bg-accent/70"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {showIndexStrip && (
          <div
            aria-hidden="true"
            className="absolute inset-y-1 end-0.5 z-10 flex flex-col justify-center"
          >
            {indexLetters.map((header) => {
              const rowIndex = rows.findIndex((r) => r.id === header.id);
              return (
                <button
                  key={header.id}
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    virtualizer.scrollToIndex(rowIndex, { align: "start" })
                  }
                  className="w-5 cursor-pointer text-center text-[10px] leading-[13px] font-medium text-muted-foreground transition-colors outline-none hover:text-foreground active:text-primary"
                >
                  {header.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showFooter && (
        <div className="shrink-0 border-t px-3.5 py-2 text-xs text-muted-foreground">
          {trimmed
            ? `${optionCount} match${optionCount === 1 ? "" : "es"}`
            : `${optionCount} options`}
        </div>
      )}
    </div>
  );
}

interface PickerRowProps {
  rowHeight: number;
  label: string;
  secondary?: string;
  hint?: string;
  leading?: React.ReactNode;
  active?: boolean;
  /** The row is the currently selected value: iOS checkmark on the trail. */
  selected?: boolean;
  onHover?: () => void;
  onClick: () => void;
  style?: React.CSSProperties;
  variant?: GeoPickerVariant;
}

function PickerRow({
  rowHeight,
  label,
  secondary,
  hint,
  leading,
  active,
  selected,
  onHover,
  onClick,
  style,
  variant = "popover",
}: PickerRowProps) {
  const isSheet = variant === "sheet";
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
        // iOS grouped-list row: full-width highlight, hairline separator
        // inset from the leading edge, checkmark as the only selected chrome.
        "flex w-full cursor-pointer select-none items-center gap-2.5 text-left text-sm outline-none transition-colors duration-75",
        "hover:bg-accent/60 data-[active=true]:bg-accent active:bg-accent/70",
        active && "bg-accent",
        isSheet ? "px-4 after:start-4" : "px-3 after:start-3",
        "relative after:absolute after:end-0 after:bottom-0 after:h-px after:bg-border/70",
      )}
      data-active={active || undefined}
      data-selected={selected || undefined}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {secondary && (
          <span className="block truncate text-xs text-muted-foreground">
            {secondary}
          </span>
        )}
      </span>
      {hint && !selected && (
        <span className="shrink-0 text-xs text-muted-foreground/70 tabular-nums">
          {hint}
        </span>
      )}
      {selected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
    </button>
  );
}
