import { NextRequest, NextResponse } from "next/server";

// OFFLINE VERSION - Returns hardcoded Indian holidays

export async function GET(request: NextRequest) {
  try {
    // Return empty for SSR - client will load holidays from localStorage
    return NextResponse.json({ events: [] });
  } catch (error: any) {
    console.error("Error fetching Indian holidays:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Indian holidays" },
      { status: 500 }
    );
  }
}
