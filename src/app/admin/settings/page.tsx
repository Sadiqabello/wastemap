import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POINT_VALUES, POINT_LABELS } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Platform configuration and information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">WasteMap</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium">Next.js 16</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium">Supabase (PostgreSQL)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Auth</span>
              <span className="font-medium">Supabase Auth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Point Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(POINT_VALUES).map(([action, points]) => (
              <div key={action} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {POINT_LABELS[action as keyof typeof POINT_LABELS]}
                </span>
                <span className="font-medium text-emerald-600">
                  +{points} pts
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">External Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
                ".supabase.co",
                ".supabase.com"
              ) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Supabase Dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
