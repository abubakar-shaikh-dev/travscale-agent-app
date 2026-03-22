// React
import { type ReactNode, useMemo, useState } from "react";

// TanStack Table
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

// ============================================================================
// TanStack Table type augmentation
// ============================================================================

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    ellipsis?: boolean;
  }
}

// UI Components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Frame, FrameFooter } from "@/components/ui/frame";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import { ChevronDownIcon, ChevronUpIcon, InboxIcon } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Column definition for DataTable.
 * Simplified API inspired by Ant Design's Table component.
 */
export interface DataTableColumn<TData> {
  /** Unique key for the column, maps to data field */
  key: keyof TData | string;
  /** Column header title */
  title: ReactNode;
  /** Column width in pixels */
  width?: number;
  /** Minimum column width in pixels (used for horizontal scroll on small screens) */
  minWidth?: number;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Whether cell text should truncate with ellipsis (defaults to false) */
  ellipsis?: boolean;
  /** Custom render function for cell content */
  render?: (value: unknown, record: TData, index: number) => ReactNode;
}

/**
 * Pagination configuration.
 * Supports both client-side and server-side pagination.
 */
export interface DataTablePagination {
  /** Current page (1-indexed for API compatibility) */
  current: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items (required for server-side pagination) */
  total?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Callback when page changes */
  onChange?: (page: number, pageSize: number) => void;
}

/**
 * Row selection configuration.
 */
export interface DataTableRowSelection<TData> {
  /** Currently selected row keys */
  selectedRowKeys?: string[];
  /** Callback when selection changes */
  onChange?: (selectedRowKeys: string[], selectedRows: TData[]) => void;
}

/**
 * Props for the DataTable component.
 */
export interface DataTableProps<TData> {
  /** Data source array */
  dataSource: TData[];
  /** Column definitions */
  columns: DataTableColumn<TData>[];
  /** Unique key field in data (defaults to 'id') */
  rowKey?: keyof TData;
  /** Show loading skeleton */
  loading?: boolean;
  /** Pagination config, false to disable */
  pagination?: DataTablePagination | false;
  /** Row selection config */
  rowSelection?: DataTableRowSelection<TData>;
  /** Default sort column key */
  defaultSortKey?: string;
  /** Default sort direction */
  defaultSortOrder?: "asc" | "desc";
  /** Custom empty state content */
  emptyText?: ReactNode;
  /** Additional class name for the table container */
  className?: string;
  /** Callback when row is clicked */
  onRowClick?: (record: TData, index: number) => void;
}

// ============================================================================
// Helper Components
// ============================================================================

function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
  if (direction === "asc") {
    return (
      <ChevronUpIcon
        aria-hidden="true"
        className="size-4 shrink-0 opacity-80"
      />
    );
  }
  if (direction === "desc") {
    return (
      <ChevronDownIcon
        aria-hidden="true"
        className="size-4 shrink-0 opacity-80"
      />
    );
  }
  return null;
}

function EmptyState({ text }: { text?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
      <InboxIcon className="size-10 opacity-40" />
      <p className="text-sm">{text ?? "No data"}</p>
    </div>
  );
}

function LoadingSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * A mature, Ant Design-inspired data table component.
 *
 * @example
 * // Basic usage
 * <DataTable
 *   dataSource={customers}
 *   columns={[
 *     { key: "name", title: "Name", sortable: true },
 *     { key: "email", title: "Email" },
 *     { key: "status", title: "Status", render: (val) => <Badge>{val}</Badge> },
 *   ]}
 * />
 *
 * @example
 * // With pagination and selection
 * <DataTable
 *   dataSource={orders}
 *   columns={columns}
 *   pagination={{
 *     current: page,
 *     pageSize: 10,
 *     total: totalCount,
 *     onChange: (page, size) => fetchOrders(page, size),
 *   }}
 *   rowSelection={{
 *     selectedRowKeys: selected,
 *     onChange: (keys, rows) => setSelected(keys),
 *   }}
 * />
 */
export function DataTable<TData extends Record<string, unknown>>({
  dataSource,
  columns,
  rowKey = "id" as keyof TData,
  loading = false,
  pagination,
  rowSelection,
  defaultSortKey,
  defaultSortOrder = "asc",
  emptyText,
  className,
  onRowClick,
}: DataTableProps<TData>) {
  // Determine if using server-side pagination
  const isServerSide = pagination && pagination.total !== undefined;
  const totalRows = isServerSide ? pagination.total! : dataSource.length;

  // -------------------------------------------------------------------------
  // Internal state
  // -------------------------------------------------------------------------
  const [sorting, setSorting] = useState<SortingState>(
    defaultSortKey
      ? [{ id: defaultSortKey, desc: defaultSortOrder === "desc" }]
      : []
  );

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: pagination ? pagination.current - 1 : 0,
    pageSize: pagination ? pagination.pageSize : 10,
  });

  const [internalSelection, setInternalSelection] = useState<RowSelectionState>(() => {
    if (!rowSelection?.selectedRowKeys) return {};
    return rowSelection.selectedRowKeys.reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as RowSelectionState
    );
  });

  // -------------------------------------------------------------------------
  // Convert our column format to TanStack Table format
  // -------------------------------------------------------------------------
  const tanstackColumns = useMemo<ColumnDef<TData>[]>(() => {
    const cols: ColumnDef<TData>[] = [];

    // Add selection column if enabled
    if (rowSelection) {
      cols.push({
        id: "__select",
        size: 40,
        minSize: 40,
        enableSorting: false,
        header: ({ table }) => {
          const isAllSelected = table.getIsAllPageRowsSelected();
          const isSomeSelected = table.getIsSomePageRowsSelected();
          return (
            <Checkbox
              aria-label="Select all rows"
              checked={isAllSelected}
              indeterminate={isSomeSelected && !isAllSelected}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      });
    }

    // Convert our columns to TanStack format
    columns.forEach((col) => {
      cols.push({
        id: String(col.key),
        accessorKey: col.key as string,
        size: col.width,
        minSize: col.minWidth,
        enableSorting: col.sortable ?? false,
        header: () => col.title,
        cell: ({ getValue, row }) => {
          const value = getValue();
          if (col.render) {
            return col.render(value, row.original, row.index);
          }
          if (col.ellipsis) {
            return (
              <span className="block truncate" title={String(value ?? "")}>
                {value as ReactNode}
              </span>
            );
          }
          return value as ReactNode;
        },
        meta: {
          align: col.align,
          ellipsis: col.ellipsis,
        },
      });
    });

    return cols;
  }, [columns, rowSelection]);

  // -------------------------------------------------------------------------
  // Table instance
  // -------------------------------------------------------------------------
  const table = useReactTable({
    data: dataSource,
    columns: tanstackColumns,
    state: {
      sorting,
      pagination: isServerSide ? undefined : internalPagination,
      rowSelection: internalSelection,
    },
    enableSortingRemoval: false,
    getRowId: (row) => String(row[rowKey]),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: isServerSide ? undefined : setInternalPagination,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(internalSelection) : updater;
      setInternalSelection(newSelection);

      // Call external onChange
      if (rowSelection?.onChange) {
        const selectedKeys = Object.keys(newSelection).filter(
          (key) => newSelection[key]
        );
        const selectedRows = dataSource.filter((row) =>
          selectedKeys.includes(String(row[rowKey]))
        );
        rowSelection.onChange(selectedKeys, selectedRows);
      }
    },
    manualPagination: isServerSide,
    pageCount: isServerSide
      ? Math.ceil(totalRows / internalPagination.pageSize)
      : undefined,
  });

  // -------------------------------------------------------------------------
  // Pagination helpers
  // -------------------------------------------------------------------------
  const currentPage = isServerSide
    ? pagination!.current
    : internalPagination.pageIndex + 1;
  const pageSize = internalPagination.pageSize;
  const pageCount = Math.ceil(totalRows / pageSize);

  const handlePageChange = (newPage: number) => {
    if (isServerSide && pagination?.onChange) {
      pagination.onChange(newPage, pageSize);
    } else {
      setInternalPagination((prev) => ({ ...prev, pageIndex: newPage - 1 }));
    }
  };

  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < pageCount;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const showPagination = pagination !== false && totalRows > 0;
  const visibleColumns = tanstackColumns.length;

  // Compute a minimum table width from column definitions so the table
  // scrolls horizontally on narrow screens instead of overlapping.
  const tableMinWidth = useMemo(() => {
    const total = columns.reduce((sum, col) => {
      return sum + (col.minWidth ?? col.width ?? 120);
    }, rowSelection ? 40 : 0);
    return `${total}px`;
  }, [columns, rowSelection]);

  return (
    <Frame className={cn("w-full", className)}>
      <Table className="table-auto" style={{ minWidth: tableMinWidth }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const colDef = header.column.columnDef;
                const colWidth = colDef.size;
                const colMinWidth = colDef.minSize;
                const align = colDef.meta?.align as
                  | "left"
                  | "center"
                  | "right"
                  | undefined;

                const headerStyle: React.CSSProperties = {};
                if (colWidth) headerStyle.width = `${colWidth}px`;
                if (colMinWidth) headerStyle.minWidth = `${colMinWidth}px`;

                return (
                  <TableHead
                    key={header.id}
                    style={Object.keys(headerStyle).length > 0 ? headerStyle : undefined}
                    className={cn(
                      align === "center" && "text-center",
                      align === "right" && "text-right"
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <SortIcon
                          direction={header.column.getIsSorted() as "asc" | "desc" | false}
                        />
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <LoadingSkeleton columns={visibleColumns} rows={pageSize} />
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(row.original, row.index)}
              >
                {row.getVisibleCells().map((cell) => {
                  const cellMeta = cell.column.columnDef.meta;
                  const align = cellMeta?.align as
                    | "left"
                    | "center"
                    | "right"
                    | undefined;
                  const isEllipsis = cellMeta?.ellipsis;

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        align === "center" && "text-center",
                        align === "right" && "text-right",
                        isEllipsis && "max-w-0"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns}>
                <EmptyState text={emptyText} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <FrameFooter className="p-2">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            {/* Results range selector */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="text-sm text-muted-foreground">Viewing</p>
              <Select
                value={currentPage}
                onValueChange={(value) => handlePageChange(value as number)}
              >
                <SelectTrigger
                  aria-label="Select page"
                  className="w-fit min-w-0"
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {Array.from({ length: pageCount }, (_, i) => {
                    const pageNum = i + 1;
                    const start = i * pageSize + 1;
                    const end = Math.min((i + 1) * pageSize, totalRows);
                    return (
                      <SelectItem key={pageNum} value={pageNum}>
                        {`${start}-${end}`}
                      </SelectItem>
                    );
                  })}
                </SelectPopup>
              </Select>
              <p className="text-sm text-muted-foreground">
                of{" "}
                <strong className="font-medium text-foreground">
                  {totalRows}
                </strong>{" "}
                results
              </p>
            </div>

            {/* Pagination controls */}
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className="sm:*:[svg]:hidden"
                    render={
                      <Button
                        disabled={!canPreviousPage}
                        onClick={() => handlePageChange(currentPage - 1)}
                        size="sm"
                        variant="outline"
                      />
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    className="sm:*:[svg]:hidden"
                    render={
                      <Button
                        disabled={!canNextPage}
                        onClick={() => handlePageChange(currentPage + 1)}
                        size="sm"
                        variant="outline"
                      />
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </FrameFooter>
      )}
    </Frame>
  );
}

// Re-export types for convenience
export type { ColumnDef } from "@tanstack/react-table";
