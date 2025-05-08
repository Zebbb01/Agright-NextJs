'use client'

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"

const availablePermissions = [
  "view_users",
  "create_users",
  "edit_users",
  "delete_users",
  "view_reports",
  "manage_settings",
]

export default function RolesPanel() {
  const [open, setOpen] = useState(false)
  const [roleName, setRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const handleCreateRole = () => {
    console.log("New Role:", roleName)
    console.log("Permissions:", selectedPermissions)
    // TODO: Submit to backend here
    setOpen(false)
    setRoleName("")
    setSelectedPermissions([])
  }

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
            {availablePermissions.map((perm) => (
              <div key={perm} className="flex items-center space-x-2">
                <Checkbox
                  id={perm}
                  checked={selectedPermissions.includes(perm)}
                  onCheckedChange={() => togglePermission(perm)}
                />
                <Label htmlFor={perm} className="text-sm">
                  {perm}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <Button className="w-full" onClick={handleCreateRole}>
          Save Role
        </Button>
      </PopoverContent>
    </Popover>
  )
}
