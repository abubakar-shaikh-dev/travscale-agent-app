// React
import { useId, useState } from "react";

// Virtual (peer dep of GeoPickerList, imported for type clarity only)

// UI Components
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerPopup } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { selectTriggerVariants } from "@/components/ui/select";

// Icons
import { ChevronsUpDownIcon, TriangleAlertIcon, XIcon } from "lucide-react";

// Form Components
import { GeoPickerList } from "./GeoPickerList";
import { FieldLabel } from "./FieldLabel";

// Form
import { useFieldContext } from "@/lib/form/form-context";

// Types
import type { GeoOption } from "@/lib/geo";

// Utils
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface GeoSelectFieldProps {
  label: string;
  placeholder?: string;
  options: GeoOption[];
  /** True while the (possibly large, lazily loaded) dataset is loading. */
  isPending?: boolean;
  searchPlaceholder?: string;
  notFoundMessage?: string;
  disabled?: boolean;
  /** Shown instead of the error slot when the field is disabled. */
  disabledHint?: string;
  required?: boolean;
  className?: string;
  /** Mobile sheet title. Defaults to "Select {label}". */
  pickerTitle?: string;
  /** Mobile sheet subtitle. Defaults to a sentence from the label. */
  pickerDescription?: string;
  /**
   * Optional quick-pick items shown as compact chips (both surfaces) while
   * no search is active. Render nothing when omitted.
   */
  popularItems?: GeoOption[];
  /** Optional leading visual per row (flag, avatar, icon). */
  renderLeading?: (option: GeoOption) => React.ReactNode;
  /** Groups the idle list under section headers (e.g. first letter). */
  groupBy?: (option: GeoOption) => string;
  /** Letter strip that jumps between sections (mobile sheet only). */
  alphabetIndex?: boolean;
  /** The dataset failed to load: swaps the list for a compact retry state. */
  fetchError?: boolean;
  onRetry?: () => void;
}

/**
 * Searchable single-select form field for geo (and currency) options.
 *
 * Desktop: an anchored popover with keyboard navigation and a virtualized
 * list. Mobile: a bottom sheet sized to its content (capped to the
 * viewport) with a drag handle, a titled header with a close button, no
 * search autofocus (so the options stay visible first), and 52px touch rows.
 * Only the presentation differs between the two; data, selection, search,
 * and keyboard logic are shared.
 */
export default function GeoSelectField({
  label,
  placeholder = "Select...",
  options,
  isPending = false,
  searchPlaceholder,
  notFoundMessage,
  disabled,
  disabledHint,
  required = false,
  className,
  pickerTitle,
  pickerDescription,
  popularItems,
  renderLeading,
  groupBy,
  alphabetIndex = false,
  fetchError = false,
  onRetry,
}: GeoSelectFieldProps) {
  const field = useFieldContext<string>();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const labelId = useId();

  // Crossing the breakpoint swaps the presentation surface (popover <-> 
  // sheet); an open state would carry stale anchors across the swap, so the
  // picker simply closes. Adjust-during-render, the React-endorsed pattern.
  const [prevIsMobile, setPrevIsMobile] = useState(isMobile);
  if (prevIsMobile !== isMobile) {
    setPrevIsMobile(isMobile);
    setOpen(false);
  }

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;
  const value = field.state.value ?? "";
  const selected = options.find((option) => option.value === value);

  const handleSelect = (next: string) => {
    field.handleChange(next);
    field.handleBlur();
    setOpen(false);
  };

  const list = (
    <GeoPickerList
      options={options}
      value={value}
      onSelect={handleSelect}
      searchPlaceholder={searchPlaceholder}
      notFoundMessage={notFoundMessage}
      autoFocusSearch={!isMobile}
      rowHeight={isMobile ? 52 : 44}
      showFooter={!isMobile}
      variant={isMobile ? "sheet" : "popover"}
      listHeight={isMobile ? 480 : 320}
      popularItems={popularItems}
      renderLeading={renderLeading}
      groupBy={groupBy}
      alphabetIndex={alphabetIndex && isMobile}
    />
  );

  const body =
    isPending && options.length === 0 ? (
      <PickerSkeleton rowHeight={isMobile ? 52 : 44} />
    ) : fetchError && options.length === 0 ? (
      <PickerError onRetry={onRetry} />
    ) : (
      list
    );

  const triggerContent = (
    <>
      <span className="flex-1 truncate text-left">
        {selected?.label ?? (value ? value : isPending ? "Loading…" : "")}
        {!selected && !value && !isPending && (
          <span className="text-muted-foreground/72">{placeholder}</span>
        )}
      </span>
      {/* Hovering a filled trigger swaps the chevron for the clear "x" (the
          group/trigger wrapper lives only on the desktop branch, so this is
          inert on mobile). */}
      <ChevronsUpDownIcon
        className={cn(
          "-me-1 size-4.5 opacity-80 transition-opacity duration-100 sm:size-4",
          value && "group-hover/trigger:opacity-0",
        )}
      />
    </>
  );

  const triggerClassName = cn(
    selectTriggerVariants({ size: "lg" }),
    // Tailwind v4 preflight leaves buttons on the default cursor.
    "cursor-pointer min-w-0",
    !value && "in-data-placeholder:text-muted-foreground/72",
  );

  // Sheet copy derives from the field label, so every dataset reads natively
  // without the component knowing what it is picking.
  const title = pickerTitle ?? `Select ${label.toLowerCase()}`;
  const description =
    pickerDescription ?? `Choose your ${label.toLowerCase()} from the list below.`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} htmlFor={labelId} required={required} />

      {/* The popover and the drawer must never both be mounted: a mounted
          Popover Root with open=true registers Floating UI dismissal even
          without its popup, so on mobile every tap outside the (absent)
          popup, including taps inside the drawer, closed the sheet. */}
      {!isMobile ? (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          {/* group/trigger lets the clear "x" (an overlay sibling, since the
              trigger itself is a button) share hover with the trigger. */}
          <div className="group/trigger relative">
            <PopoverPrimitive.Trigger
              id={labelId}
              disabled={disabled}
              aria-invalid={hasError || undefined}
              className={triggerClassName}
              data-slot="geo-select-trigger"
            >
              {triggerContent}
            </PopoverPrimitive.Trigger>

            {value && !disabled && (
              <button
                type="button"
                aria-label={`Clear ${label.toLowerCase()}`}
                onClick={(event) => {
                  // Empty the field without opening the dropdown.
                  event.preventDefault();
                  event.stopPropagation();
                  field.handleChange("");
                  field.handleBlur();
                }}
                className="absolute end-2.5 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-foreground/25 text-background opacity-0 outline-none transition-[opacity,background-color] duration-100 hover:bg-foreground/45 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/trigger:opacity-100 active:bg-foreground/35"
              >
                <XIcon
                  className="size-2.5"
                  strokeWidth={3.5}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
              side="bottom"
              sideOffset={6}
              align="start"
              collisionPadding={8}
              // Shift the popup back inside the viewport instead of flipping
              // to the perpendicular side: a tall list reads better as one
              // bottom-anchored surface than as a panel stuck to the edge.
              collisionAvoidance={{ side: "shift", align: "shift" }}
              className="z-50 select-none"
            >
              <PopoverPrimitive.Popup
                className="flex max-h-(--available-height) w-(--anchor-width) min-w-64 max-w-(--available-width) origin-(--transform-origin) flex-col overflow-hidden rounded-lg border bg-popover/90 text-popover-foreground shadow-lg/5 backdrop-blur-xl outline-none transition-[scale,opacity] data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:scale-98 data-ending-style:opacity-0"
                aria-label={label}
              >
                {body}
              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      ) : (
        <>
          <button
            type="button"
            id={labelId}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={triggerClassName}
            data-slot="geo-select-trigger"
          >
            {triggerContent}
          </button>

          <Drawer open={open} onOpenChange={setOpen}>
            {/* Content height up to the viewport cap: a short dataset
                renders a short sheet, a long one fills toward 92dvh and
                scrolls its list internally. */}
            <DrawerPopup className="max-h-[92dvh]" showBar>
              <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-5">
                <div className="min-w-0">
                  <h2 className="font-heading text-xl font-semibold leading-tight tracking-tight">
                    {title}
                  </h2>
                  <p className="mt-1 text-[15px] text-muted-foreground">
                    {description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="-me-1 -mt-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-foreground outline-none transition-colors duration-100 hover:bg-accent active:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon className="size-4.5" aria-hidden="true" />
                </button>
              </div>
              {body}
            </DrawerPopup>
          </Drawer>
        </>
      )}

      {disabled && disabledHint ? (
        <p className="text-sm text-muted-foreground/80">{disabledHint}</p>
      ) : hasError ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.map((e) => (e as { message?: string }).message ?? e).join(", ")}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Loading rows that mirror the list layout, so the sheet keeps its size
 * while the dataset streams in instead of flashing a centered spinner.
 */
function PickerSkeleton({ rowHeight }: { rowHeight: number }) {
  return (
    <div className="flex min-w-0 shrink-0 flex-col" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center px-4"
          style={{ height: rowHeight }}
        >
          <Skeleton
            className="h-4 rounded-md"
            style={{ width: `${34 + ((index * 17) % 38)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function PickerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5 px-4 py-10 text-center">
      <TriangleAlertIcon
        className="size-5 text-muted-foreground/60"
        aria-hidden="true"
      />
      <p className="text-sm font-medium">Unable to load items</p>
      <p className="text-xs text-muted-foreground">
        Check your connection and try again.
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 cursor-pointer"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
