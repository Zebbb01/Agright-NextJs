// src/components/data-table-controls.tsx
"use client";

import React from "react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Settings2 } from "lucide-react";
import { DataTableColumn } from "@/types/data-table";

interface DataTableControlsProps<T> {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  columns: DataTableColumn<T>[];
  visibleColumnIds: string[];
  onColumnVisibilityChange: (columnId: string, isChecked: boolean) => void;
}

export function DataTableControls<T>({
  searchTerm,
  onSearchChange,
  columns,
  visibleColumnIds,
  onColumnVisibilityChange,
}: DataTableControlsProps<T>) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Search Input */}
      <Input
        placeholder="Search all columns..."
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        className="max-w-sm"
      />

      {/* Column Visibility Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <Settings2 className="mr-2 h-4 w-4" /> View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns
            .filter((column) => column.toggleable !== false && column.id) // Only show toggleable columns with an ID
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={visibleColumnIds.includes(column.id!)}
                onCheckedChange={(isChecked) =>
                  onColumnVisibilityChange(column.id!, isChecked)
                }
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}