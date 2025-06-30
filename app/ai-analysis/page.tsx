import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UploadIcon, FileTextIcon, HistoryIcon } from "lucide-react";

export default function AiAnalysisPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="AI Analysis" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis Pipeline</CardTitle>
              <CardDescription>
                Upload your social media data (CSV) to analyze performance, extract insights, and generate reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
              <UploadIcon className="w-12 h-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">Upload Content Data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop your CSV file here, or click to browse.
              </p>
              <Button className="mt-4">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Processing History</CardTitle>
              <CardDescription>
                View the status and results of your past uploads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for processing history table */}
              <div className="flex items-center justify-center text-muted-foreground py-12">
                <HistoryIcon className="mr-2 h-5 w-5" />
                <span>No processing history found.</span>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 