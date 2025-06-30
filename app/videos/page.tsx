"use client";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VideoIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const videoUrls = [
  "https://spskuukuyaeyrrzecqkn.supabase.co/storage/v1/object/public/final-round-ai-files/videos/Video-936.mp4",
  "https://spskuukuyaeyrrzecqkn.supabase.co/storage/v1/object/public/final-round-ai-files/videos/Video-516.mp4"
  // Add more video URLs here as needed
  // ...
];

const VIDEOS_PER_PAGE = 12;

export default function VideosPage() {
  const [open, setOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(videoUrls.length / VIDEOS_PER_PAGE);
  const paginatedVideos = videoUrls.slice((page - 1) * VIDEOS_PER_PAGE, page * VIDEOS_PER_PAGE);

  const handleOpen = (url: string) => {
    setActiveVideo(url);
    setOpen(true);
  };

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
              {videoUrls.length === 0 ? (
                <div className="flex items-center justify-center text-muted-foreground py-24">
                  <VideoIcon className="mr-2 h-8 w-8" />
                  <p className="text-lg">Your video library is empty.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                    {paginatedVideos.map((url) => (
                      <div
                        key={url}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border shadow hover:shadow-lg transition flex items-center justify-center bg-black max-w-[220px] max-h-[220px] w-full aspect-square mx-auto"
                        style={{ aspectRatio: '1 / 1' }}
                        onClick={() => handleOpen(url)}
                      >
                        <video
                          src={url}
                          className="w-full h-full object-cover bg-black"
                          style={{ maxWidth: '220px', maxHeight: '220px' }}
                          controls={false}
                          preload="metadata"
                          muted
                          onMouseOver={e => (e.currentTarget.play())}
                          onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <VideoIcon className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        Previous
                      </Button>
                      <span className="mx-2 text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl w-full p-0 bg-black" showCloseButton>
                  {activeVideo && (
                    <video
                      src={activeVideo}
                      controls
                      autoPlay
                      className="w-full h-[60vh] bg-black"
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 