"use client";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UploadIcon, FileTextIcon, FileSpreadsheet, CloudUpload } from "lucide-react";
import React, { useRef, useState } from "react";

export default function Page() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
      } else {
        setSelectedFile(null);
        setError("Only .csv files are accepted. Please select a valid CSV file.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isCsvFile(file)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setSelectedFile(null);
        setError("Only .csv files are accepted. Please select a valid CSV file.");
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      // Optionally clear file or show success
    }, 2000);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Quick Sync" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>File Upload</CardTitle>
                <CardDescription>
                  Upload your social media data (CSV) for analysis.
                </CardDescription>
              </div>
              {selectedFile && (
                <Button className="ml-4 mt-1" variant="default" onClick={handleUpload} disabled={isUploading}>
                  Upload <CloudUpload className="ml-2 cursor-pointer h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
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
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}