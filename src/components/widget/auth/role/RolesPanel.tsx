"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import type { RolesPanelProps } from "@/types/auth";
import { createRole } from "@/app/api/services/roleService"; // This import path should be correct assuming roleService.ts is in app/api/services

export default function RolesPanel({
  onAddRole,
  editingRole,
  setEditingRole,
}: RolesPanelProps) {
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This is only for the "Add Role" functionality now
  const handleAddRole = async () => {
    if (!roleName.trim()) {
      setError("Role name cannot be empty");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Assuming createRole in roleService.ts correctly calls /api/auth/roles
      const created = await createRole(roleName); 
      onAddRole(created);
      setRoleName("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRoleName("");
    setError(null);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        if (val === false && !loading) {
          handleClose();
        } else {
          setOpen(val);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="default" className="ml-auto flex items-center gap-2">
          <Plus size={16} />
          Add Role
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium">Create New Role</h4>
          <p className="text-sm text-muted-foreground">
            Enter a name for the new role
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="roleName">Role Name</Label>
          <Input
            id="roleName"
            value={roleName}
            onChange={(e) => {
              setRoleName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter role name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddRole();
            }}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddRole}
            disabled={loading || !roleName.trim()}
          >
            {loading ? "Saving..." : "Create Role"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}