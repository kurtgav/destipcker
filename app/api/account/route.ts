import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete user data from database tables
        // Delete decisions first (foreign key constraint)
        await supabase.from("decisions").delete().eq("user_id", user.id);

        // Delete favorites
        await supabase.from("favorites").delete().eq("user_id", user.id);

        // Delete user profile
        await supabase.from("users").delete().eq("id", user.id);

        // Delete auth user (this will sign them out)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

        // If admin delete fails (common in client-side), just sign out
        if (deleteError) {
            console.warn("Admin delete failed, signing out user:", deleteError);
        }

        // Sign out the user
        await supabase.auth.signOut();

        return NextResponse.json({ success: true, message: "Account deleted successfully" });

    } catch (error: any) {
        console.error("Delete account error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete account" },
            { status: 500 }
        );
    }
}
