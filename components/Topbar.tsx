"use client";

import { Moon, Sun } from "lucide-react";
import { IconButton } from "./IconButton";
import { useTheme } from "./ThemeProvider";

export function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border dark:border-border-dark px-4 md:px-6">
      <div>
        <p className="font-display text-base font-bold">Money Accounts Manager</p>
        <p className="text-xs text-muted dark:text-muted-dark">Quản lý & tự động hóa tài khoản kiếm tiền</p>
      </div>
      <IconButton
        icon={theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        onClick={toggleTheme}
      />
    </header>
  );
}
