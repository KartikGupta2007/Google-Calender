import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch contacts from Google People API
    const response = await fetch(
      "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos&pageSize=100&sortOrder=LAST_MODIFIED_DESCENDING",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching contacts:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch contacts", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform contacts to a simpler format
    const contacts = (data.connections || [])
      .filter((person: any) => person.emailAddresses && person.emailAddresses.length > 0)
      .map((person: any) => {
        const name = person.names?.[0]?.displayName || "";
        const email = person.emailAddresses?.[0]?.value || "";
        const photo = person.photos?.[0]?.url || "";

        return {
          name,
          email,
          avatar: photo,
        };
      })
      .filter((contact: any) => contact.email); // Only include contacts with emails

    return NextResponse.json({ contacts });
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
