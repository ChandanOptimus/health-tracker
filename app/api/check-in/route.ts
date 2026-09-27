import { NextResponse } from "next/server";
import { updateCheckInWeight } from "@/lib/health/google-sheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const week = Number(body.week);
    const day = Number(body.day);
    const weightKg = Number(body.weightKg);

    if (!Number.isInteger(week) || week < 1 || week > 48) {
      return NextResponse.json(
        {
          error: "Week must be between 1 and 48.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(day) || day < 1 || day > 7) {
      return NextResponse.json(
        {
          error: "Day must be between 1 and 7.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      return NextResponse.json(
        {
          error: "Weight must be a valid positive number.",
        },
        { status: 400 }
      );
    }

    await updateCheckInWeight(
      week,
      day,
      weightKg
    );

    return NextResponse.json({
      success: true,
      message: "Check-in weight saved successfully.",
      week,
      day,
      weightKg,
    });
  } catch (error) {
    console.error("Check-in save error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save check-in.",
      },
      { status: 500 }
    );
  }
}