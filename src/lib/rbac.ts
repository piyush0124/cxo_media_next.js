export type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "CONTRIBUTOR" | "SUBSCRIBER";

const ROLE_RANK: Record<Role, number> = {
  ADMIN: 5,
  EDITOR: 4,
  AUTHOR: 3,
  CONTRIBUTOR: 2,
  SUBSCRIBER: 1,
};

export function hasMinRole(userRole: string, minRole: Role) {
  const r = (userRole as Role) || "SUBSCRIBER";
  return (ROLE_RANK[r] ?? 0) >= ROLE_RANK[minRole];
}

export function isAdmin(userRole?: string) {
  return (userRole || "") === "ADMIN";
}
