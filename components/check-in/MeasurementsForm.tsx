"use client";

import { FormEvent, useState } from "react";

const weeks = Array.from({ length: 48 }, (_, index) => index + 1);

type MeasurementField = {
  key:
    | "rightBicepsIn"
    | "leftBicepsIn"
    | "chestIn"
    | "rightThighIn"
    | "leftThighIn"
    | "waistIn";
  label: string;
  placeholder: string;
};

const fields: MeasurementField[] = [
  {
    key: "rightBicepsIn",
    label: "Right Biceps",
    placeholder: "13.5",
  },
  {
    key: "leftBicepsIn",
    label: "Left Biceps",
    placeholder: "13.4",
  },
  {
    key: "chestIn",
    label: "Chest",
    placeholder: "40",
  },
  {
    key: "rightThighIn",
    label: "Right Thigh",
    placeholder: "23",
  },
  {
    key: "leftThighIn",
    label: "Left Thigh",
    placeholder: "22.8",
  },
  {
    key: "waistIn",
    label: "Waist",
    placeholder: "36",
  },
];

export function MeasurementsForm() {
  const [week, setWeek] = useState(1);

  const [values, setValues] = useState({
    rightBicepsIn: "",
    leftBicepsIn: "",
    chestIn: "",
    rightThighIn: "",
    leftThighIn: "",
    waistIn: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateValue(
    key: keyof typeof values,
    value: string
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    const measurements = {
      rightBicepsIn: Number(values.rightBicepsIn),
      leftBicepsIn: Number(values.leftBicepsIn),
      chestIn: Number(values.chestIn),
      rightThighIn: Number(values.rightThighIn),
      leftThighIn: Number(values.leftThighIn),
      waistIn: Number(values.waistIn),
    };

    const hasInvalidValue = Object.values(measurements).some(
      (value) => !Number.isFinite(value) || value <= 0
    );

    if (hasInvalidValue) {
      setError("Please enter all six measurements.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/check-in/measurements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week,
          ...measurements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save measurements."
        );
      }

      setMessage(
        `Week ${week} measurements saved successfully.`
      );

      setValues({
        rightBicepsIn: "",
        leftBicepsIn: "",
        chestIn: "",
        rightThighIn: "",
        leftThighIn: "",
        waistIn: "",
      });

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save measurements."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel check-in-form-panel">
      <div className="check-in-form-header">
        <p className="eyebrow">Body Measurements</p>

        <h2 className="section-title">
          Add Measurements
        </h2>

        <p className="mt-2 text-sm muted">
          Record your body measurements for a specific week.
          All measurements are in inches.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="check-in-form-grid">
          <div className="check-in-form-field">
            <label
              htmlFor="measurement-week"
              className="check-in-form-label"
            >
              Week
            </label>

            <select
              id="measurement-week"
              value={week}
              onChange={(event) =>
                setWeek(Number(event.target.value))
              }
              className="check-in-form-select"
            >
              {weeks.map((value) => (
                <option key={value} value={value}>
                  Week {value}
                </option>
              ))}
            </select>
          </div>

          {fields.map((field) => (
            <div
              key={field.key}
              className="check-in-form-field"
            >
              <label
                htmlFor={field.key}
                className="check-in-form-label"
              >
                {field.label}
              </label>

              <div className="check-in-form-weight-wrapper">
                <input
                  id={field.key}
                  type="number"
                  min="1"
                  max="100"
                  step="0.1"
                  value={values[field.key]}
                  onChange={(event) =>
                    updateValue(
                      field.key,
                      event.target.value
                    )
                  }
                  placeholder={field.placeholder}
                  className="check-in-form-input check-in-form-weight-input"
                />

                <span className="check-in-form-unit">
                  in
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="check-in-form-action mt-5">
          <button
            type="submit"
            disabled={saving}
            className="check-in-form-button"
          >
            {saving
              ? "Saving..."
              : "Save Measurements"}
          </button>
        </div>

        {message && (
          <p className="check-in-form-message">
            {message}
          </p>
        )}

        {error && (
          <p className="check-in-form-error">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}