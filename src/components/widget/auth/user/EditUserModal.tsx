"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditUserModalProps } from "@/types/auth";
import { useEditUserForm } from "@/hooks/user/useEditUserForm"; // This hook is key
import { Spinner } from "@/components/ui/spinner";

export default function EditUserModal(props: EditUserModalProps) {
  const {
    editingUser,
    setEditingUser,
    onUpdateUser,
    roles,
  } = props;

  const {
    username,
    setUsername,
    email,
    setEmail,
    selectedRole,
    setSelectedRole,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    changePassword,
    setChangePassword,
    loading,
    error,
    setError,
    handleUpdateUser, // This function from the hook is critical
  } = useEditUserForm({ editingUser, roles, onUpdateUser, setEditingUser });

  return (
    <Dialog
      open={!!editingUser}
      onOpenChange={(isOpen) => {
        if (!isOpen && !loading) {
          setEditingUser(null);
          setError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information below</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                setSelectedRole(value);
                if (error) setError(null);
              }}
            >
              <SelectTrigger id="edit-role">
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
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                id="change-password"
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="change-password">Change Password</Label>
            </div>
            {changePassword && (
              <>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="edit-password">New Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-confirm-password">
                    Confirm New Password
                  </Label>
                  <Input
                    id="edit-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditingUser(null)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} disabled={loading}>
            {loading ? <Spinner /> : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}