import { MealOption as MealOptionType } from "@/types/nutrition";

export function MealOption({
  option,
  showNumber = true,
}: {
  option: MealOptionType;
  showNumber?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5">
      {showNumber && (
        <div className="mb-4 text-xs font-medium uppercase tracking-wider text-white/45">
          Option
        </div>
      )}

      <ul className="space-y-3">
        {option.items.map(
          (item, index) => (
            <li
              key={`${option.id}-${index}`}
              className="flex gap-3 text-sm leading-6 text-white/80"
            >
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />

              <span>{item}</span>
            </li>
          ),
        )}
      </ul>

      {option.macros && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-4">
          {option.macros.protein !==
            undefined && (
            <Macro
              label="Protein"
              value={`${option.macros.protein}g`}
            />
          )}

          {option.macros.carbs !==
            undefined && (
            <Macro
              label="Carbs"
              value={`${option.macros.carbs}g`}
            />
          )}

          {option.macros.fats !==
            undefined && (
            <Macro
              label="Fat"
              value={`${option.macros.fats}g`}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Macro({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[.03] px-3 py-2">
      <span className="text-xs muted">
        {label}
      </span>

      <span className="ml-2 text-xs font-medium">
        {value}
      </span>
    </div>
  );
}