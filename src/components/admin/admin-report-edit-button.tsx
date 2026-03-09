"use client";

import { AdminEditDialog } from "./admin-edit-dialog";
import { adminEditReport } from "@/lib/actions/admin";
import { CATEGORY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";

interface Props {
  reportId: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  description?: string;
}

export function AdminReportEditButton({ reportId, title, category, severity, status, description }: Props) {
  return (
    <AdminEditDialog
      title={`Edit: ${title}`}
      triggerSize="icon"
      fields={[
        { name: "title", label: "Title", defaultValue: title, required: true },
        { name: "description", label: "Description", type: "textarea", defaultValue: description || "" },
        {
          name: "category",
          label: "Category",
          type: "select",
          defaultValue: category,
          options: Object.entries(CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l })),
        },
        {
          name: "severity",
          label: "Severity",
          type: "select",
          defaultValue: severity,
          options: Object.entries(SEVERITY_LABELS).map(([v, l]) => ({ value: v, label: l })),
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          defaultValue: status,
          options: Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
        },
      ]}
      onSave={async (data) => adminEditReport(reportId, data as { title?: string; category?: string; severity?: string; status?: string; description?: string })}
    />
  );
}
