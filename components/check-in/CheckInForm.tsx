"use client";

import { FormEvent, useState } from "react";

const weeks = Array.from({ length: 48 }, (_, index) => index + 1);
const days = Array.from({ length: 7 }, (_, index) => index + 1);

export function CheckInForm() {
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(1);
  const [weightKg, setWeightKg] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    const weight = Number(weightKg);

    if (!Number.isFinite(weight) || weight <= 0) {
      setError("Please enter a valid weight.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week,
          day,
          weightKg: weight,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save check-in."
        );
      }

      setMessage(
        `Week ${week}, Day ${day} saved successfully.`
      );

      /*
       * Keep the entered weight visible after saving.
       * The page will be refreshed so Dashboard/Check-in
       * calculations immediately use the new value.
       */
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save check-in."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel p-5">
      <div className="mb-5">
        <p className="eyebrow">Daily Tracking</p>

        <h2 className="section-title">
          Add Check-in
        </h2>

        <p className="mt-2 text-sm muted">
          Enter your weight for a specific day in
          your 48-week plan.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-4"
      >
        {/* Week */}
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Week
          </span>

          <select
  value={week}
  onChange={(e) => setWeek(Number(e.target.value))}
  className="check-in-form-select"
>
  {weeks.map((value) => (
    <option key={value} value={value}>
      Week {value}
    </option>
  ))}
</select>
        </label>

        {/* Day */}
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Day
          </span>

         <select
  value={day}
  onChange={(e) => setDay(Number(e.target.value))}
  className="check-in-form-select"
>
  {days.map((value) => (
    <option key={value} value={value}>
      Day {value}
    </option>
  ))}
</select>
        </label>

        {/* Weight */}
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Weight
          </span>

          <div className="relative">
            <input
              type="number"
              min="1"
              max="300"
              step="0.1"
              value={weightKg}
              onChange={(event) =>
                setWeightKg(event.target.value)
              }
              placeholder="81.0"
              className="w-full rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 pr-12 text-sm outline-none"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm muted">
              kg
            </span>
          </div>
        </label>

        {/* Save */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl border border-white/10 bg-white/[.08] px-4 py-3 text-sm font-medium transition hover:bg-white/[.12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Check-in"}
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-sm">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}