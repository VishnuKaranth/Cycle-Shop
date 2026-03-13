import { prisma } from "@repo/database";

export const createContext = async (opts?: {
  req?: Request;
  resHeaders?: Headers;
  userId?: string | null;
}) => {
  return {
    prisma,
    userId: opts?.userId || null,
    req: opts?.req,
    resHeaders: opts?.resHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
