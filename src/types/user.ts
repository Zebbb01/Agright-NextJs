export type UserType = {
  id: number;
  email: string;
  name: string;
  role: {
    id: number;
    name: string;
    status: number;
  } | null;
};

export interface RoleType {
  id: number;
  name: string;
  status: number;
}