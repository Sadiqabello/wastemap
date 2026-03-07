"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCreateUser } from "@/lib/actions/admin";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("reporter");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setEmail("");
    setPassword("");
    setFullName("");
    setRole("reporter");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await adminCreateUser(email, password, fullName, role);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`User ${fullName} created as ${role}`);
        resetForm();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with a specific role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="add-name">Full Name</Label>
            <Input
              id="add-name"
              placeholder="Adamu Musa"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="user@wastemap.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-password">Password</Label>
            <Input
              id="add-password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="add-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reporter">Reporter</SelectItem>
                <SelectItem value="authority">Authority</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-stone-500">
              {role === "reporter" && "Can submit reports, join events, earn points"}
              {role === "authority" && "Can update report statuses and manage cleanups"}
              {role === "admin" && "Full system access including user management"}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
