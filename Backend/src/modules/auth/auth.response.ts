import type { User } from "../../generated/prisma/client.js";

export const sanitizedUserResponse = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};