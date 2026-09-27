import { NextRequest, NextResponse } from "next/server";

import {
  getWorkoutLogs,
  getWorkoutLogByDate,
  saveWorkoutLog,
} from "@/lib/health/workout-log-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const date =
      request.nextUrl.searchParams.get(
        "date",
      );

    if (date) {
      const workoutLog =
        await getWorkoutLogByDate(date);

      return NextResponse.json({
        workoutLog,
      });
    }

    const workoutLogs =
      await getWorkoutLogs();

    return NextResponse.json({
      workoutLogs,
    });
  } catch (error) {
    console.error(
      "Failed to fetch workout logs:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch workout logs.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid workout log.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.id !== "string" ||
      typeof body.date !== "string" ||
      typeof body.workoutDay !==
        "number" ||
      !Array.isArray(body.exercises)
    ) {
      return NextResponse.json(
        {
          error:
            "Workout log is missing required fields.",
        },
        {
          status: 400,
        },
      );
    }

    const workoutLog =
      await saveWorkoutLog(body);

    return NextResponse.json({
      workoutLog,
    });
  } catch (error) {
    console.error(
      "Failed to save workout log:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to save workout log.",
      },
      {
        status: 500,
      },
    );
  }
}