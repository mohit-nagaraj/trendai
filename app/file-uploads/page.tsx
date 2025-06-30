import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UploadIcon, FileTextIcon } from "lucide-react";

export default function FileUploadsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="File Uploads" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Upload your social media data (CSV) for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-24 border-2 border-dashed border-gray-300 rounded-lg">
              <UploadIcon className="w-16 h-16 text-gray-400" />
              <h3 className="mt-6 text-xl font-semibold">Upload Content Data</h3>
              <p className="mt-2 text-md text-muted-foreground">
                Drag and drop your CSV file here, or click to browse.
              </p>
              <Button className="mt-6">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 