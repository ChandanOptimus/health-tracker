import { NextResponse } from "next/server";
import { updateCheckInMeasurements } from "@/lib/health/google-sheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const week = Number(body.week);

    const measurements = {
      rightBicepsIn: Number(body.rightBicepsIn),
      leftBicepsIn: Number(body.leftBicepsIn),
      chestIn: Number(body.chestIn),
      rightThighIn: Number(body.rightThighIn),
      leftThighIn: Number(body.leftThighIn),
      waistIn: Number(body.waistIn),
    };

    if (!Number.isInteger(week) || week < 1 || week > 48) {
      return NextResponse.json(
        { error: "Week must be between 1 and 48." },
        { status: 400 }
      );
    }

    const measurementValues = Object.values(measurements);

    if (
      measurementValues.some(
        (value) => !Number.isFinite(value) || value <= 0
      )
    ) {
      return NextResponse.json(
        { error: "All measurements must be valid positive numbers." },
        { status: 400 }
      );
    }

    await updateCheckInMeasurements(week, measurements);

    return NextResponse.json({
      success: true,
      message: "Measurements saved successfully.",
      week,
      measurements,
    });
  } catch (error) {
    console.error("Measurement save error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save measurements.",
      },
      { status: 500 }
    );
  }
}