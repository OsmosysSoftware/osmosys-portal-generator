// Customize these roles to match your backend API
export const UserRoles = {
  USER: 0,
  ADMIN: 1,
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRoles.USER]: 'User',
  [UserRoles.ADMIN]: 'Admin',
};
