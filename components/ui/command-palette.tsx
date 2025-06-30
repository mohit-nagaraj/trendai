"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

const ROUTES = [
  { label: "Dashboard", value: "/dashboard" },
  { label: "AI Analysis", value: "/ai-analysis" },
  { label: "AI Trends", value: "/ai-trends" },
  { label: "Videos", value: "/videos" },
  { label: "Team", value: "/team" },
  { label: "File Uploads", value: "/file-uploads" },
  { label: "Reports", value: "/reports" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      // These classnames are for the dialog overlay and content
      className="[&_[cmdk-overlay]]:bg-black/60 [&_[cmdk-overlay]]:backdrop-blur-sm [&_[cmdk-dialog]]:bg-white [&_[cmdk-dialog]]:dark:bg-neutral-900 [&_[cmdk-dialog]]:rounded-xl [&_[cmdk-dialog]]:shadow-2xl [&_[cmdk-dialog]]:border [&_[cmdk-dialog]]:border-neutral-200 [&_[cmdk-dialog]]:dark:border-neutral-700"
    >
      <Command.Input
        autoFocus
        placeholder="Go to..."
        className="w-full px-4 py-3 text-lg bg-transparent outline-none border-b border-neutral-200 dark:border-neutral-700"
      />
      <Command.List className="max-h-[300px] overflow-y-auto p-2">
        <Command.Empty>No results found.</Command.Empty>
        {ROUTES.map((route) => (
          <Command.Item
            key={route.value}
            value={route.value}
            onSelect={() => {
              runCommand(() => router.push(route.value));
            }}
            className="flex items-center px-3 py-2.5 rounded-md cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/60"
          >
            {route.label}
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
} 