export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  profileImage?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CHIEFEDITOR = 'chief-editor',
  EDITOR = 'editor',
}
