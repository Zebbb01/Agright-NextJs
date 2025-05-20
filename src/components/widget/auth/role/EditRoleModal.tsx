"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateRole } from "@/app/api/services/roleService";
import { EditRoleModalProps } from "@/types/auth";

export default function EditRoleModal({
  editingRole,
  setEditingRole,
  onUpdateRole,
}: EditRoleModalProps) {
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update the role name when the editingRole changes
  useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.name);
    } else {
      setRoleName("");
    }
  }, [editingRole]);

  const handleUpdateRole = async () => {
    if (!editingRole || !roleName.trim()) {
      setError("Role name cannot be empty");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const updated = await updateRole(editingRole.id, { name: roleName });
      onUpdateRole(updated);
      setEditingRole(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={!!editingRole}
      onOpenChange={(isOpen) => {
        if (!isOpen && !loading) {
          setEditingRole(null);
          setError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>Update the role name below</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-role-name">Role Name</Label>
            <Input
              id="edit-role-name"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter role name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateRole();
              }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditingRole(null)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={loading || !roleName.trim()}
          >
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
