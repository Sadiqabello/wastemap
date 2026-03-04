"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeUserRole } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Shield } from "lucide-react";

interface ChangeRoleDialogProps {
  userId: string;
  currentRole: string;
  userName: string;
}

export function ChangeRoleDialog({
  userId,
  currentRole,
  userName,
}: ChangeRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (role === currentRole) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await changeUserRole(userId, role);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Changed ${userName}'s role to ${role}`);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role for {userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reporter">Reporter</SelectItem>
              <SelectItem value="authority">Authority</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || role === currentRole}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
