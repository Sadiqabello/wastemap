import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard - WasteMapNaija",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="pl-64">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
