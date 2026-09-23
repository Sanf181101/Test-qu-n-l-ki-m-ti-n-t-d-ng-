"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Zap,
  Wallet,
  ShoppingBag,
  LineChart,
  Image as ImageIcon,
  Upload,
  ScrollText,
  BellRing,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Account Hub", icon: Users },
  { href: "/content", label: "Content Queue", icon: ListChecks },
  { href: "/automation", label: "Automation Engine", icon: Zap },
  { href: "/finance", label: "Finance & P&L", icon: Wallet },
  { href: "/affiliate", label: "Affiliate Tracker", icon: ShoppingBag },
  { href: "/kpi", label: "KPI Dashboard", icon: LineChart },
  { href: "/assets", label: "Asset Library", icon: ImageIcon },
  { href: "/import", label: "Import Center", icon: Upload },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
  { href: "/alerts", label: "Alerts", icon: BellRing },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="hidden w-64 shrink-0 flex-col gap-1 border-r border-border dark:border-border-dark p-3 md:flex"
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark"
                : "text-muted dark:text-muted-dark hover:bg-surface-raised dark:hover:bg-surface-raised-dark hover:text-ink dark:hover:text-ink-dark"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
