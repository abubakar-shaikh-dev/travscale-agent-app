// React
import { useId, useState } from "react";

// Virtual (peer dep of GeoPickerList, imported for type clarity only)

// UI Components
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { ChevronsUpDownIcon } from "lucide-react";

// UI Components
import { Drawer, DrawerPopup } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { selectTriggerVariants } from "@/components/ui/select";

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
  /**
   * Offer a "use this" row for values outside the dataset (cities change
   * faster than any bundled list).
   */
  allowCustom?: boolean;
  disabled?: boolean;
  /** Shown instead of the error slot when the field is disabled. */
  disabledHint?: string;
  required?: boolean;
  className?: string;
}

/**
 * Searchable single-select form field for geo (and currency) options.
 *
 * Desktop: an anchored popover with keyboard navigation and a virtualized
 * list. Mobile: a full-height bottom sheet with swipe-to-dismiss, no search
 * autofocus (so the options stay visible first), and 52px touch rows.
 */
export default function GeoSelectField({
  label,
  placeholder = "Select...",
  options,
  isPending = false,
  searchPlaceholder,
  notFoundMessage,
  allowCustom = false,
  disabled,
  disabledHint,
  required = false,
  className,
}: GeoSelectFieldProps) {
  const field = useFieldContext<string>();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const labelId = useId();

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
      allowCustom={allowCustom}
      autoFocusSearch={!isMobile}
      rowHeight={isMobile ? 52 : 44}
      showFooter={!isMobile}
      fillHeight={isMobile}
    />
  );

  const triggerContent = (
    <>
      <span className="flex-1 truncate text-left">
        {selected?.label ?? (value ? value : isPending ? "Loading…" : "")}
        {!selected && !value && !isPending && (
          <span className="text-muted-foreground/72">{placeholder}</span>
        )}
      </span>
      <ChevronsUpDownIcon className="-me-1 size-4.5 opacity-80 sm:size-4" />
    </>
  );

  const triggerClassName = cn(
    selectTriggerVariants({ size: "lg" }),
    "min-w-0",
    !value && "in-data-placeholder:text-muted-foreground/72",
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} htmlFor={labelId} required={required} />

      {/* The popover and the drawer must never both be mounted: a mounted
          Popover Root with open=true registers Floating UI dismissal even
          without its popup, so on mobile every tap outside the (absent)
          popup, including taps inside the drawer, closed the sheet. */}
      {!isMobile ? (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Trigger
            id={labelId}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            className={triggerClassName}
            data-slot="geo-select-trigger"
          >
            {triggerContent}
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
              side="bottom"
              sideOffset={6}
              align="start"
              className="z-50 select-none"
            >
              <PopoverPrimitive.Popup
                className="w-(--anchor-width) min-w-64 max-w-(--available-width) origin-(--transform-origin) rounded-lg border bg-popover not-dark:bg-clip-padding text-popover-foreground shadow-lg/5 outline-none transition-[scale,opacity] data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:scale-98 data-ending-style:opacity-0"
                aria-label={label}
              >
                {isPending && options.length === 0 ? <PickerLoading /> : list}
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
            <DrawerPopup className="h-dvh" showBar>
              <div className="flex items-center justify-between border-b px-5 pb-4 pt-5">
                <div>
                  <h2 className="font-heading font-semibold text-lg leading-none">
                    {label}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {selected?.label ? `Selected: ${selected.label}` : placeholder}
                  </p>
                </div>
              </div>
              {isPending && options.length === 0 ? <PickerLoading /> : list}
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

function PickerLoading() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Spinner className="size-4" />
      Loading options…
    </div>
  );
}
