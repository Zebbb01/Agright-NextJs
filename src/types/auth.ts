import { UserType, RoleType } from './user'
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // add this
  user: UserType | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface UsersPanelProps {
  roles: RoleType[];
  onAddUser: (user: UserType) => void;
  editingUser: UserType | null;
  setEditingUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

export interface EditUserModalProps {
  editingUser: UserType | null;
  setEditingUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  onUpdateUser: (user: UserType) => void;
  roles: RoleType[];
}

export interface EditRoleModalProps {
  editingRole: RoleType | null;
  setEditingRole: React.Dispatch<React.SetStateAction<RoleType | null>>;
  onUpdateRole: (role: RoleType) => void;
}


export interface RolesPanelProps {
  onAddRole: (role: RoleType) => void;
  editingRole: RoleType | null;
  setEditingRole: React.Dispatch<React.SetStateAction<RoleType | null>>;
}
