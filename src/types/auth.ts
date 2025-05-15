export type Role = {
  id: string;
  name: string;
  status: number;
  permissions?: Permission[]; // <-- optional if not all roles have it
};

export type User = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  password: string;
};

export type Permission = {
  name: string;
  active: boolean;
};
