import { createAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get current play count
    const { data: challenge, error: fetchError } = await admin
      .from("custom_challenges")
      .select("plays")
      .eq("id", challengeId)
      .single();

    if (fetchError) {
      console.error("Error fetching challenge:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    // Increment play count
    const { error: updateError } = await admin
      .from("custom_challenges")
      .update({ plays: (challenge.plays || 0) + 1 })
      .eq("id", challengeId);

    if (updateError) {
      console.error("Error updating challenge:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      plays: (challenge.plays || 0) + 1,
    });
  } catch (error) {
    console.error("Error updating play count:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
