// src/components/widget/auth/user/UsersPanel.tsx
"use client";

import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UsersPanelProps } from "@/types/auth";
import { useUserForm } from "@/hooks/user/useUserForm"; // This hook is key

export default function UsersPanel({ roles, onAddUser }: UsersPanelProps) {
  const {
    open,
    setOpen,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    selectedRole,
    setSelectedRole,
    loading,
    error,
    handleCreateUser, // This function from the hook is critical
    handleClose,
    setError,
  } = useUserForm(roles, onAddUser);

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        if (!val && !loading) handleClose();
        else setOpen(val);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="default" className="ml-auto flex items-center gap-2">
          <Plus size={16} />
          Add User
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium">Create New User</h4>
          <p className="text-sm text-muted-foreground">
            Enter user details below
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Enter full name"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError(null);
            }}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => {
              setSelectedRole(value);
              if (error) setError(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}