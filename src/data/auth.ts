import type { User, Role, Permission } from "@/types/auth";

// Dummy Users
export const dummyUser: User[] = [
  {
    id: "1",
    name: "Admin",
    email: "admin@gmail.com",
    roleId: "1",
    password: "Admin123",
  },
  {
    id: "2",
    name: "Joe Relampagos",
    email: "encoder@gmail.com",
    roleId: "2",
    password: "Encoder123",
  },
];

// Dummy Permissions
export const allPermissions: Permission[] = [
  { name: "view_users", active: true },
  { name: "create_users", active: true },
  { name: "edit_users", active: true },
  { name: "delete_users", active: true },
  { name: "view_reports", active: true },
  { name: "manage_settings", active: true },
];

const encoderPermissions: Permission[] = [
  { name: "view_users", active: true },
  { name: "create_users", active: true },
  { name: "edit_users", active: false },
  { name: "delete_users", active: false },
];

const customerPermissions: Permission[] = [
  { name: "view_users", active: false },
  { name: "view_reports", active: false },
];

// Roles with Permissions
export const roles: Role[] = [
  { id: "1", name: "Admin", status: 1, permissions: allPermissions },
  { id: "2", name: "Encoder", status: 1, permissions: encoderPermissions },
  { id: "3", name: "Customer", status: 0, permissions: customerPermissions },
];

export const users = dummyUser;
