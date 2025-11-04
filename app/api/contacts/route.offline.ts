import { NextRequest, NextResponse } from "next/server";

// OFFLINE VERSION - Returns mock contacts data

export async function GET(request: NextRequest) {
  try {
    // Return empty for SSR - client will load from localStorage
    return NextResponse.json({ contacts: [] });
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
