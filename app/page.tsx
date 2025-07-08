"use client";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UploadIcon, FileTextIcon, FileSpreadsheet, CloudUpload, Download } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const [username, setUsername] = useState("");
  const [scrapedPosts, setScrapedPosts] = useState<any[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<any[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCsvFile = (file: File) => file.name.toLowerCase().endsWith('.csv');

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isCsvFile(file)) {
        setSelectedFile(file);
        setError(null);
        setSuccess(null);
      } else {
        setSelectedFile(null);
        setError("Only .csv files are accepted. Please select a valid CSV file.");
        setSuccess(null);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isCsvFile(file)) {
        setSelectedFile(file);
        setError(null);
        setSuccess(null);
      } else {
        setSelectedFile(null);
        setError("Only .csv files are accepted. Please select a valid CSV file.");
        setSuccess(null);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!source) {
      toast.error("Please select a source.");
      return;
    }
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("source", source);
      const res = await fetch("/api/v1/content/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed. Please try again.");
        setSuccess(null);
      } else {
        setSuccess("File uploaded successfully!");
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
        toast.warning("Processing is queued", {
          description: "Check the dashboard page after a while",
        });
        console.log("Processing is queued");
      }
    } catch {
      setError("An error occurred during upload. Please try again.");
      setSuccess(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleScrape = async () => {
    if (!source) {
      toast.error("Please select a source.");
      return;
    }
    if (!username) {
      toast.error("Please enter a username.");
      return;
    }
    setIsScraping(true);
    setError(null);
    setSuccess(null);
    try {
      const endpoint = source === "instagram" ? "/api/v1/content/instagram-json" : "/api/v1/content/tiktok-json";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source === "instagram" ? { username, resultsLimit: 30 } : { unique_id: username, maxResults: 30 })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scrape failed. Please try again.");
        setScrapedPosts([]);
      } else {
        setScrapedPosts(data);
        setSuccess("Scrape successful!");
      }
    } catch {
      setError("An error occurred during scraping. Please try again.");
      setScrapedPosts([]);
    } finally {
      setIsScraping(false);
    }
  };
  const handleSelectPost = (post: any) => {
    setSelectedPosts((prev) =>
      prev.some((p) => p.id === post.id)
        ? prev.filter((p) => (p.id !== post.id))
        : [...prev, post]
    );
  };
  const handleProcessSelected = async () => {
    if (!selectedPosts.length) {
      toast.error("Please select at least one post to process.");
      return;
    }
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/v1/content/process-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: selectedPosts, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Processing failed. Please try again.");
      } else {
        setSuccess("Posts processed successfully!");
        setSelectedPosts([]);
        setScrapedPosts([]);
        toast.warning("Processing is queued", {
          description: "Check the dashboard page after a while",
        });
      }
    } catch {
      setError("An error occurred during processing. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Quick Sync" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader className="flex flex-col items-start gap-4">
              <div className="w-full flex flex-col md:flex-row md:items-center md:gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <Select
                    value={source}
                    onValueChange={setSource}
                    disabled={isUploading || isScraping}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                  {!(selectedFile&&selectedFile.name)&&<Input
                    className="w-[220px]"
                    placeholder={`Enter ${source==="instagram"?"":"@"}username`}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={isUploading || isScraping}
                  />}
                  {username&&<Button
                    className="ml-auto cursor-pointer"
                    variant="secondary"
                    onClick={handleScrape}
                    disabled={isUploading || isScraping || !source || !username}
                  >
                    {isScraping ? "Scraping..." : "Scrape"}
                  </Button>}
                  
                </div>
                
              </div>
            </CardHeader>
            <CardContent>
              {(!username&&!(selectedFile&&selectedFile.name))&&<div className="w-full text-center mb-4">
                <span className="text-muted-foreground text-sm">OR</span>
              </div>}
              {(!username && !scrapedPosts.length) && (
                <div
                  className={`flex flex-col items-center justify-center text-center p-24 border-2 border-dashed rounded-lg transition-colors duration-200 ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                  onDragEnter={isUploading ? undefined : handleDrag}
                  onDragOver={isUploading ? undefined : handleDrag}
                  onDragLeave={isUploading ? undefined : handleDrag}
                  onDrop={isUploading ? undefined : handleDrop}
                  onClick={isUploading ? undefined : handleButtonClick}
                  style={{ cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.6 : 1 }}
                  aria-disabled={isUploading}
                >
                  <input
                    type="file"
                    accept=".csv"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handleChange}
                    disabled={isUploading}
                  />
                  {selectedFile ? <FileSpreadsheet className="w-16 h-16 text-primary/80" /> : <UploadIcon className="w-16 h-16 text-gray-400" />}
                  <h3 className="mt-6 text-xl font-semibold">Upload Content Data</h3>
                  {!selectedFile && <p className="mt-2 text-md text-muted-foreground">
                    Drag and drop your CSV file here, or click to browse.
                  </p>}
                  {selectedFile && (
                    <div className="mt-4 text-primary font-medium">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                  {isUploading ? (
                    <div className="w-full flex flex-col items-center mt-6">
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-pulse w-full" style={{ minWidth: 32 }} />
                      </div>
                      <span className="mt-2 text-sm text-primary">Uploading...</span>
                    </div>
                  ) : (
                    <Button variant={"outline"} className="mt-6 cursor-pointer" onClick={e => { e.stopPropagation(); handleButtonClick(); }} disabled={isUploading}>
                      <FileTextIcon className="mr-2 h-4 w-4" />
                      Select {selectedFile && "A New"} File
                    </Button>
                  )}
                  {error && (
                    <div className="mt-4 text-red-600 font-medium">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mt-4 text-green-600 font-medium">
                      {success}
                    </div>
                  )}
                </div>
              )}
              {scrapedPosts.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-wrap gap-4">
                    {scrapedPosts.map((post, idx) => (
                      <div key={post.id} className={`border relative rounded-lg p-4 w-72 ${selectedPosts.some(p => (p.id === post.id)) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        onClick={() => handleSelectPost(post)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="font-semibold truncate">{post.caption || post.title || post.shortCode || post.text}</div>
                        <div className="text-xs text-muted-foreground truncate">{post.url || post.webVideoUrl}</div>
                        <div className="absolute top-2 right-2">
                          <input type="checkbox" checked={selectedPosts.some(p => (p.id === post.id))} readOnly />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4 w-fit" onClick={handleProcessSelected} disabled={isUploading || !selectedPosts.length}>
                    {isUploading ? "Processing..." : "Process Selected"}
                  </Button>
                </div>
              )}
                <div>

                {(source&&!username) && (
                  <div className="flex gap-2 mt-2 items-center">
                  <div className="w-full flex justify-end">
                    <a
                      href={`/${source}-template.csv`}
                      download
                      className="text-primary/70 text-sm cursor-pointer flex gap-1"
                      onClick={e => e.stopPropagation()}
                      >
                      <Download className="w-4 h-4"/> <div><span className="capitalize">{source}</span> template</div>
                    </a>
                  </div>
                  <Button className="cursor-pointer" variant="default" onClick={handleUpload} disabled={isUploading || !selectedFile}>
                    Upload <CloudUpload className="ml-2 cursor-pointer h-4 w-4" />
                  </Button>
                    </div>
                )}
                </div>
                {/* Download template option */}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}