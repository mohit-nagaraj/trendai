"use client";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { VideoIcon, ImageIcon, LoaderCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { platformBadge } from "@/lib/badge-colors";

const VIDEOS_PER_PAGE = 12;
const BUCKET = "final-round-ai-files";
const FOLDER = "videos";

function getFileType(url: string) {
  const ext = url.split('.').pop()?.toLowerCase();
  if (["mp4", "mov", "webm"].includes(ext || "")) return "video";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image";
  return "unknown";
}

function extractPlatformAndId(url: string) {
  // Extract filename from URL
  const filename = url.split('/').pop() || '';
  // Regex to match platform_id.ext format
  const match = filename.match(/^(instagram|tiktok)_(\d+)\./);
  if (match) {
    return {
      platform: match[1],
      id: match[2]
    };
  }
  return null;
}

export default function VideosPage() {
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: string } | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 1000 });
      if (error) {
        setMediaFiles([]);
        setLoading(false);
        return;
      }
      const files = (data || [])
        .filter((f) => f.name && !f.name.includes(".emptyFolderPlaceholder"))
        .map((f) => {
          const url = supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${f.name}`).data.publicUrl;
          return { url, type: getFileType(f.name) };
        });
      setMediaFiles(files);
      setLoading(false);
    }
    fetchFiles();
  }, []);

  const totalPages = Math.ceil(mediaFiles.length / VIDEOS_PER_PAGE);
  const paginatedFiles = mediaFiles.slice((page - 1) * VIDEOS_PER_PAGE, page * VIDEOS_PER_PAGE);

  const handleOpen = (media: { url: string; type: string }) => {
    setActiveMedia(media);
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
              <CardTitle>Video & Image Library</CardTitle>
              <CardDescription>
                A collection of your uploaded and analyzed videos and images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center text-muted-foreground py-24">
                  <LoaderCircle className="mr-2 h-8 w-8 animate-spin" />
                  <p className="text-lg">Loading media...</p>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="flex items-center justify-center text-muted-foreground py-24">
                  <VideoIcon className="mr-2 h-8 w-8" />
                  <p className="text-lg">Your media library is empty.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                    {paginatedFiles.map((media) => {
                      const platformInfo = extractPlatformAndId(media.url);
                      return (
                        <div key={media.url} className="flex flex-col items-center">
                          <div
                            className="relative group cursor-pointer rounded-lg overflow-hidden border shadow hover:shadow-lg transition flex items-center justify-center bg-black max-w-[220px] max-h-[220px] w-full aspect-square mx-auto"
                            style={{ aspectRatio: '1 / 1' }}
                            onClick={() => handleOpen(media)}
                          >
                            {media.type === "video" ? (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover bg-black"
                                style={{ maxWidth: '220px', maxHeight: '220px' }}
                                controls={false}
                                preload="metadata"
                                muted
                                onMouseOver={e => (e.currentTarget.play())}
                                onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                              />
                            ) : media.type === "image" ? (
                              <img
                                src={media.url}
                                alt="Media thumbnail"
                                className="w-full h-full object-cover bg-black"
                                style={{ maxWidth: '220px', maxHeight: '220px' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">Unknown</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              {media.type === "video" ? (
                                <VideoIcon className="h-10 w-10 text-white" />
                              ) : media.type === "image" ? (
                                <ImageIcon className="h-10 w-10 text-white" />
                              ) : null}
                            </div>
                          </div>
                          {platformInfo && (
                            <div className="mt-2 flex flex-col items-center gap-1">
                              <Badge variant="outline" className={`${platformBadge(platformInfo.platform)}`}>
                                {platformInfo.platform}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{platformInfo.id}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  {activeMedia && (
                    activeMedia.type === "video" ? (
                      <video
                        src={activeMedia.url}
                        controls
                        autoPlay
                        className="w-full h-[60vh] bg-black"
                      />
                    ) : activeMedia.type === "image" ? (
                      <img
                        src={activeMedia.url}
                        alt="Full media"
                        className="w-full h-[60vh] object-contain bg-black"
                      />
                    ) : null
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