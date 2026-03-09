"use client";

import { AdminEditDialog } from "./admin-edit-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { adminEditUser, adminDeleteUser } from "@/lib/actions/admin";

interface Props {
  userId: string;
  userName: string;
  email: string;
  phoneNumber?: string;
}

export function AdminUserEditDelete({ userId, userName, email, phoneNumber }: Props) {
  return (
    <>
      <AdminEditDialog
        title={`Edit: ${userName}`}
        triggerSize="icon"
        fields={[
          { name: "full_name", label: "Full Name", defaultValue: userName, required: true },
          { name: "email", label: "Email", type: "email", defaultValue: email },
          { name: "phone_number", label: "Phone Number", defaultValue: phoneNumber || "" },
        ]}
        onSave={async (data) => adminEditUser(userId, data as { full_name?: string; email?: string; phone_number?: string })}
      />
      <DeleteConfirmDialog
        itemName={userName}
        onConfirm={async () => adminDeleteUser(userId)}
      />
    </>
  );
}
