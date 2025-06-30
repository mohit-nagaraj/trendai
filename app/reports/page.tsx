import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FileDownIcon } from "lucide-react";

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Reports" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                A list of your previously generated reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for reports list */}
              <div className="flex items-center justify-center text-muted-foreground py-24">
                <FileDownIcon className="mr-2 h-8 w-8" />
                <p className="text-lg">No reports have been generated yet.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 