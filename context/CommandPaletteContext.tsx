"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(
  undefined
);

export const CommandPaletteProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (context === undefined) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider"
    );
  }
  return context;
}; 