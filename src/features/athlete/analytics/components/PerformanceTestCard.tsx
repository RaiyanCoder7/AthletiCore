import { useState } from "react";
import { Save } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { addPerformanceTest } from "@/services/firebase/performance";

interface PerformanceForm {
  sprintSpeed: string;
  strength: string;
  stamina: string;
  agility: string;
  accuracy: string;
  endurance: string;
}

const initialForm: PerformanceForm = {
  sprintSpeed: "",
  strength: "",
  stamina: "",
  agility: "",
  accuracy: "",
  endurance: "",
};

const fields = [
  {
    key: "sprintSpeed",
    label: "Sprint Speed",
  },
  {
    key: "strength",
    label: "Strength",
  },
  {
    key: "stamina",
    label: "Stamina",
  },
  {
    key: "agility",
    label: "Agility",
  },
  {
    key: "accuracy",
    label: "Accuracy",
  },
  {
    key: "endurance",
    label: "Endurance",
  },
] as const;

export default function PerformanceTestCard() {
  const [form, setForm] =
    useState<PerformanceForm>(initialForm);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    key: keyof PerformanceForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setMessage("Please log in first.");
      return;
    }

    const values = Object.values(form);

    if (values.some((value) => value === "")) {
      setMessage("Please enter all performance values.");
      return;
    }

    const numericValues = values.map(Number);

    if (
      numericValues.some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0 ||
          value > 100
      )
    ) {
      setMessage(
        "Each value must be between 0 and 100."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await addPerformanceTest(user.uid, {
        date: new Date()
          .toISOString()
          .split("T")[0],

        sprintSpeed: Number(form.sprintSpeed),
        strength: Number(form.strength),
        stamina: Number(form.stamina),
        agility: Number(form.agility),
        accuracy: Number(form.accuracy),
        endurance: Number(form.endurance),
      });

      setForm(initialForm);
      setMessage(
        "Performance test saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save performance test:",
        error
      );

      setMessage(
        "Failed to save performance test."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardCard accent="blue">
      <SectionHeading
        title="Performance Test"
        subtitle="Record your latest athletic performance metrics"
      />

      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={field.key}
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {field.label}
              </label>

              <input
                id={field.key}
                type="number"
                min="0"
                max="100"
                step="1"
                value={form[field.key]}
                onChange={(event) =>
                  handleChange(
                    field.key,
                    event.target.value
                  )
                }
                placeholder="0 - 100"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : "Save Performance Test"}
          </button>

          {message && (
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
        </div>
      </form>
    </DashboardCard>
  );
}