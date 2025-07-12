// src/components/table/data-table-controls.tsx
"use client";

import React from "react";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Settings2, Search } from "lucide-react"; // Import Search icon
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
      {/* Search Input with Icon */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search any columns..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="max-w-sm pl-9" // Add left padding to make space for the icon
        />
      </div>

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
            .filter((column) => column.toggleable !== false && column.id)
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