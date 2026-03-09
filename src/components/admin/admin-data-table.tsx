import type { ReactNode } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface AdminDataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  renderCell: (row: Record<string, unknown>, key: string) => ReactNode;
  onRowClick?: string;
}

export function AdminDataTable({
  columns,
  data,
  renderCell,
  onRowClick,
}: AdminDataTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <Inbox className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">No data found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  function buildRowUrl(row: Record<string, unknown>): string | undefined {
    if (!onRowClick) return undefined;
    return onRowClick.replace(/:(\w+)/g, (_, key) => String(row[key] ?? ""));
  }

  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => {
            const url = buildRowUrl(row);
            const rowContent = columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {renderCell(row, col.key)}
              </TableCell>
            ));

            if (url) {
              return (
                <TableRow key={(row.id as string) ?? i} className="cursor-pointer">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Link href={url} className="block">
                        {renderCell(row, col.key)}
                      </Link>
                    </TableCell>
                  ))}
                </TableRow>
              );
            }

            return (
              <TableRow key={(row.id as string) ?? i}>
                {rowContent}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
