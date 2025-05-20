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