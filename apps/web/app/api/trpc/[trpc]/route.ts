import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@repo/api";
import { createClient } from "../../../../src/lib/supabase/server";

const handler = async (req: Request) => {
  // Extract user from Supabase session
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // No valid session — proceed as unauthenticated
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req, userId }),
  });
};

export { handler as GET, handler as POST };
