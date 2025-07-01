"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileTextIcon, RotateCcwIcon, Link2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const BUCKET = "final-round-ai-files";
const FOLDER = "uploads";
const PAGE_SIZE = 10;

// Define a type for Supabase Storage file items
interface FileItem {
  id?: string;
  name: string;
  path?: string;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
  lastModified?: string;
  size?: number;
  mimetype?: string;
  metadata?: Record<string, unknown>;
}

export default function FileUploadsPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchFiles() {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: _error } = await supabase.storage.from(BUCKET).list(FOLDER, {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" }
    });
    console.log("supabase data", data);

    if (_error) {
      setFiles([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const filtered = (data ?? []).filter((file: FileItem) => file.name !== ".emptyFolderPlaceholder");
    const sorted = filtered.sort((a, b) =>
      new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()
    );
    setTotalCount(sorted.length);
    setFiles(sorted.slice(from, to + 1));
    setLoading(false);
  }

  async function handleDownload(file: FileItem) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${FOLDER}/${file.name}`, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  function getFileName(file: FileItem) {
    if (file.name) return file.name;
    if (file.path) {
      const match = file.path.match(/([^/]+)$/);
      return match ? match[1] : file.path;
    }
    return "Unknown";
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="File Uploads" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>
                View and download your uploaded CSV files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left">File Name</th>
                      <th className="px-3 py-2 text-left">Upload Time</th>
                      <th className="px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8">Loading...</td>
                      </tr>
                    ) : files.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8">No files found.</td>
                      </tr>
                    ) : (
                      files.map((file) => (
                        <tr key={file.id || file.name}>
                         
                          <td className="px-3 py-2 flex items-center gap-2"><FileTextIcon className="w-5 h-5 text-muted-foreground" />{getFileName(file)}</td>
                          <td className="px-3 py-2">
                            {file.created_at
                              ? new Date(file.created_at).toLocaleString()
                              : "Unknown"}
                          </td>
                          <td className="px-3 py-2 flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Re-initiate"
                              onClick={() => {}} // No-op for now
                            >
                              <RotateCcwIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Download"
                              onClick={() => handleDownload(file)}
                            >
                              <Link2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) =>
                      p < Math.ceil(totalCount / PAGE_SIZE) ? p + 1 : p
                    )
                  }
                  disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 