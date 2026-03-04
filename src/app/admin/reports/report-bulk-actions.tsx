"use client";

import { useState, useCallback } from "react";
import { BulkStatusBar } from "@/components/admin/bulk-status-bar";

interface ReportBulkActionsProps {
  reportIds: string[];
  children: React.ReactNode;
}

export function ReportBulkActions({
  reportIds,
  children,
}: ReportBulkActionsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLDivElement>) => {
      const target = e.target as HTMLInputElement;
      if (target.name !== "reportSelect") return;

      setSelected((prev) =>
        target.checked
          ? [...prev, target.value]
          : prev.filter((id) => id !== target.value)
      );
    },
    []
  );

  return (
    <div onChange={handleChange}>
      <BulkStatusBar selectedIds={selected} onClear={() => setSelected([])} />
      {children}
    </div>
  );
}
