import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VideoIcon } from "lucide-react";

export default function VideosPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Videos" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Video Library</CardTitle>
              <CardDescription>
                A collection of your uploaded and analyzed videos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for video grid */}
              <div className="flex items-center justify-center text-muted-foreground py-24">
                <VideoIcon className="mr-2 h-8 w-8" />
                <p className="text-lg">Your video library is empty.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 