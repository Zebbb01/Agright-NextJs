"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import type { Permission, Role } from "@/types/auth";
import { allPermissions } from "@/data/auth";

export default function RolesPanel() {
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) => {
      const exists = prev.find((p) => p.name === permissionName);
      return exists
        ? prev.filter((p) => p.name !== permissionName)
        : [...prev, { name: permissionName, active: true }];
    });
  };

  const handleCreateRole = () => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: roleName,
      status: 1,
      permissions: selectedPermissions,
    };

    console.log("Created Role:", newRole);
    // TODO: Push to backend or add to dummy roles array

    setOpen(false);
    setRoleName("");
    setSelectedPermissions([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default" className="ml-auto flex items-center gap-2">
          <Plus size={16} />
          Create Role
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roleName">Role Name</Label>
          <Input
            id="roleName"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
          />
        </div>
        <div className="space-y-2">
          <Label>Permissions</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
            {allPermissions && allPermissions.length > 0 ? (
              allPermissions.map((perm) => (
                <div key={perm.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={perm.name}
                    checked={selectedPermissions.some(
                      (p) => p.name === perm.name
                    )}
                    onCheckedChange={() => togglePermission(perm.name)}
                  />
                  <Label htmlFor={perm.name} className="text-sm">
                    {perm.name}
                  </Label>
                </div>
              ))
            ) : (
              <p>No permissions available</p>
            )}
          </div>
        </div>
        <Button className="w-full" onClick={handleCreateRole}>
          Save Role
        </Button>
      </PopoverContent>
    </Popover>
  );
}
