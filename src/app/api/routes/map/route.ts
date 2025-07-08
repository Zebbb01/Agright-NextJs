// src/app/api/routes/map/route.ts
import { NextResponse } from "next/server";
import { getAllLocationsWithImages } from "@/services"; // Adjust path if needed

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

export async function GET() {
  try {
    const locations = await getAllLocationsWithImages();
    return NextResponse.json(locations);
  } catch (error: any) {
    console.error("API Error fetching locations:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}