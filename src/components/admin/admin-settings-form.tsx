"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateSettings } from "@/lib/actions/admin-settings";
import type { PlatformSettingRow } from "@/types/database";
import {
  Settings,
  Star,
  Percent,
  ShieldAlert,
  Loader2,
  Save,
  Clock,
} from "lucide-react";

type GroupedSettings = Record<string, PlatformSettingRow[]>;

interface AdminSettingsFormProps {
  settings: GroupedSettings;
}

const CATEGORY_META: Record<
  string,
  { label: string; description: string; icon: React.ReactNode }
> = {
  general: {
    label: "General",
    description: "Basic platform configuration",
    icon: <Settings className="h-4 w-4" />,
  },
  points: {
    label: "Points",
    description: "Point values awarded for user actions",
    icon: <Star className="h-4 w-4" />,
  },
  fees: {
    label: "Fees",
    description: "Platform fee and commission percentages",
    icon: <Percent className="h-4 w-4" />,
  },
  limits: {
    label: "Limits",
    description: "System limits and constraints",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
};

function settingLabel(key: string): string {
  // "points.report_submitted" -> "Report Submitted"
  const short = key.split(".").slice(1).join(".");
  return short
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferInputType(value: unknown): "text" | "number" | "boolean" {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "text";
}

function parseSettingValue(raw: unknown): unknown {
  // JSONB values come as their native types already
  return raw;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SettingsCategoryCard({
  category,
  items,
}: {
  category: string;
  items: PlatformSettingRow[];
}) {
  const meta = CATEGORY_META[category] ?? {
    label: category,
    description: "",
    icon: <Settings className="h-4 w-4" />,
  };

  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const item of items) {
      initial[item.key] = parseSettingValue(item.value);
    }
    return initial;
  });

  const [isPending, startTransition] = useTransition();

  function handleChange(key: string, raw: string, type: "text" | "number" | "boolean") {
    let parsed: unknown;
    if (type === "number") {
      parsed = Number(raw);
      if (isNaN(parsed as number)) return;
    } else if (type === "boolean") {
      parsed = raw === "true";
    } else {
      parsed = raw;
    }
    setValues((prev) => ({ ...prev, [key]: parsed }));
  }

  function handleToggle(key: string) {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    const payload = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }));

    startTransition(async () => {
      const result = await updateSettings(payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${meta.label} settings saved successfully.`);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {meta.icon}
          <div>
            <CardTitle className="text-base">{meta.label}</CardTitle>
            {meta.description && (
              <CardDescription className="text-xs">
                {meta.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const type = inferInputType(parseSettingValue(item.value));
          const currentValue = values[item.key];

          return (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={item.key} className="text-sm font-medium">
                  {settingLabel(item.key)}
                </Label>
                <span
                  className="flex items-center gap-1 text-[10px] text-muted-foreground"
                  title={`Last updated: ${item.updated_at}`}
                >
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(item.updated_at)}
                </span>
              </div>

              {item.description && (
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}

              {type === "boolean" ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!currentValue}
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    currentValue ? "bg-emerald-600" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      currentValue ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              ) : type === "number" ? (
                <Input
                  id={item.key}
                  type="number"
                  value={String(currentValue ?? "")}
                  onChange={(e) =>
                    handleChange(item.key, e.target.value, "number")
                  }
                  className="max-w-[200px]"
                />
              ) : (
                <Input
                  id={item.key}
                  type="text"
                  value={String(currentValue ?? "")}
                  onChange={(e) =>
                    handleChange(item.key, e.target.value, "text")
                  }
                />
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsForm({
  settings,
}: AdminSettingsFormProps) {
  const categoryOrder = ["general", "points", "fees", "limits"];
  const categories = categoryOrder.filter((cat) => settings[cat]?.length);

  // Include any categories not in the predefined order
  for (const cat of Object.keys(settings)) {
    if (!categories.includes(cat)) categories.push(cat);
  }

  return (
    <Tabs defaultValue={categories[0] ?? "general"}>
      <TabsList>
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <TabsTrigger key={cat} value={cat} className="gap-1.5">
              {meta?.icon}
              {meta?.label ?? cat}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {categories.map((cat) => (
        <TabsContent key={cat} value={cat}>
          <SettingsCategoryCard category={cat} items={settings[cat]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
