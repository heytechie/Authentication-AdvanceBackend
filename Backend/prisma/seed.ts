import {
  PrismaClient,
  RoleName,
} from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

const rolePermissions: Record<RoleName, string[]> = {
  [RoleName.USER]: [
    "user:read",
  ],

  [RoleName.ADMIN]: [
    "user:read",
    "user:update",
    "user:delete",
    "role:read",
    "role:assign",
    "permission:read",
  ],
};


async function main() {
  // -------------------------
  // Create permissions
  // -------------------------

  const permissionNames = [
    ...new Set(
      Object.values(rolePermissions).flat(),
    ),
  ];

  await prisma.permission.createMany({
    data: permissionNames.map((name) => ({
      name,
    })),
    skipDuplicates: true,
  });

  // -------------------------
  // Create roles
  // -------------------------

  await prisma.role.createMany({
    data: Object.values(RoleName).map((name) => ({
      name,
      isSystem: true,
    })),
    skipDuplicates: true,
  });

  // -------------------------
  // Fetch roles + permissions
  // -------------------------

  const roles = await prisma.role.findMany();

  const permissions =
    await prisma.permission.findMany({
      where: {
        name: {
          in: permissionNames,
        },
      },
    });

  const roleMap = new Map(
    roles.map((role) => [
      role.name,
      role.id,
    ]),
  );

  const permissionMap = new Map(
    permissions.map((permission) => [
      permission.name,
      permission.id,
    ]),
  );

  // -------------------------
  // Create role permissions
  // -------------------------

  const rolePermissionData =
    Object.entries(rolePermissions).flatMap(
      ([roleName, permissions]) =>
        permissions.map((permissionName) => ({
          roleId: roleMap.get(
            roleName as RoleName,
          )!,
          permissionId:
            permissionMap.get(
              permissionName,
            )!,
        })),
    );

  await prisma.rolePermission.createMany({
    data: rolePermissionData,
    skipDuplicates: true,
  });

  console.log(
    "RBAC seed completed successfully",
  );
}

main()
  .catch((error) => {
    console.error(
      "RBAC seed failed:",
      error,
    );
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });