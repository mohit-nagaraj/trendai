"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useCommandPalette } from "@/context/CommandPaletteContext";

const ROUTES = [
  { label: "Quick Sync", value:"/"},
  { label: "Dashboard", value: "/dashboard" },
  { label: "AI Analysis", value: "/ai-analysis" },
  { label: "AI Trends", value: "/ai-trends" },
  { label: "Quick Post", value:"/quick-post"},
  { label: "Videos & Images", value: "/content" },
  { label: "Team", value: "/team" },
  { label: "File Uploads", value: "/file-uploads" }
];

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, setIsOpen } = useCommandPalette();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

  const runCommand = (command: () => unknown) => {
    setIsOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 w-full max-w-[50vw] max-h-[50vh] overflow-hidden">
        <Command.Input
          autoFocus
          placeholder="Search or Cmd+K to open"
          className="w-full px-4 py-3 text-lg bg-transparent outline-none border-b border-neutral-200 dark:border-neutral-700"
        />
        <Command.List className="max-h-[calc(50vh-60px)] overflow-y-auto p-2">
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
      </div>
    </Command.Dialog>
  );
}