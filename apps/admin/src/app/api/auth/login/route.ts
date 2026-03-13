import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@repo/database";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();

    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // 2. Verify ADMIN Role in Database
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: { role: true }
    });

    if (user?.role !== "ADMIN") {
      // Sign out if not admin
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Insufficient permissions. Admin access required." }, { status: 403 });
    }

    return NextResponse.json({ success: true, role: "ADMIN" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
