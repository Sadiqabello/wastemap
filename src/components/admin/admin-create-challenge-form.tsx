"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createChallenge } from "@/lib/actions/admin-challenges";
import { POINT_LABELS } from "@/lib/constants";

export function AdminCreateChallengeForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createChallenge(formData);
    setLoading(false);

    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input");
    } else {
      toast.success("Challenge created!");
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Challenge
          </CardTitle>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="challenge-title">Title</Label>
              <Input id="challenge-title" name="title" required placeholder="Report 5 waste sites this week" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenge-desc">Description</Label>
              <Textarea id="challenge-desc" name="description" placeholder="Optional description" rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action_type">Action Type</Label>
                <Select name="action_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(POINT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_count">Target Count</Label>
                <Input id="target_count" name="target_count" type="number" min="1" required placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus_points">Bonus Points</Label>
                <Input id="bonus_points" name="bonus_points" type="number" min="1" required placeholder="50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Challenge
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
