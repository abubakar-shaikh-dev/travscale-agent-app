// React
import { type ReactNode } from "react";

// Router
import { Link, useRouter } from "@tanstack/react-router";

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

// Icons
import { ArrowLeftIcon } from "lucide-react";

// Types
export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /**
   * Show a back button. Can be:
   * - `true`: Uses router history.back()
   * - `string`: Navigates to the specified href
   */
  back?: boolean | string;
}

interface PageHeaderBreadcrumbsProps {
  breadcrumbs: BreadcrumbEntry[];
}

/**
 * Breadcrumb component for the header bar.
 * Renders inline with the sidebar trigger in SidebarLayout.
 */
export function PageHeaderBreadcrumbs({
  breadcrumbs,
}: PageHeaderBreadcrumbsProps) {
  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <BreadcrumbItem key={crumb.label}>
              {isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink render={<Link to={crumb.href ?? "#"} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Page header with title, description, optional back button, and action buttons.
 * Use this below the header bar for page-level context.
 *
 * @example
 * // With history back
 * <PageHeader title="Customer Details" back />
 *
 * @example
 * // With explicit href
 * <PageHeader title="Edit Customer" back="/customers" />
 *
 * @example
 * // With actions
 * <PageHeader
 *   title="Customers"
 *   description="Manage your customers"
 *   actions={<Button>Add Customer</Button>}
 * />
 */
export default function PageHeader({
  title,
  description,
  actions,
  back,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof back === "string") {
      router.navigate({ to: back });
    } else {
      router.history.back();
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-start gap-3">
        {back && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="mt-0.5 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </Button>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
