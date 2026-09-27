import { NextRequest, NextResponse } from "next/server";

import {
  getWorkoutSchedule,
  saveWorkoutSchedule,
} from "@/lib/health/workout-schedule-store";

import {
  WEEKDAYS,
  WeeklyWorkoutSchedule,
} from "@/types/workout-schedule";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schedule =
      await getWorkoutSchedule();

    return NextResponse.json({
      schedule,
    });
  } catch (error) {
    console.error(
      "Failed to load workout schedule:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load workout schedule.",
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

    const schedule =
      body?.schedule;

    if (
      !schedule ||
      typeof schedule !== "object"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid workout schedule.",
        },
        {
          status: 400,
        },
      );
    }

    const cleanedSchedule =
      {} as WeeklyWorkoutSchedule;

    for (const weekday of WEEKDAYS) {
      const value =
        schedule[weekday];

      if (
        value !== null &&
        typeof value !== "number"
      ) {
        return NextResponse.json(
          {
            error:
              `Invalid workout assignment for ${weekday}.`,
          },
          {
            status: 400,
          },
        );
      }

      if (
        typeof value === "number" &&
        (!Number.isInteger(value) ||
          value < 1 ||
          value > 7)
      ) {
        return NextResponse.json(
          {
            error:
              `Invalid workout day for ${weekday}.`,
          },
          {
            status: 400,
          },
        );
      }

      cleanedSchedule[weekday] =
        value;
    }

    const savedSchedule =
      await saveWorkoutSchedule(
        cleanedSchedule,
      );

    return NextResponse.json({
      schedule: savedSchedule,
    });
  } catch (error) {
    console.error(
      "Failed to save workout schedule:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to save workout schedule.",
      },
      {
        status: 500,
      },
    );
  }
}