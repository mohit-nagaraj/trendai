"use client";
import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

const PAGE_SIZE = 20;

function statusColor(status: string) {
    switch (status) {
        case "pending": return "bg-yellow-200 text-yellow-800";
        case "processing": return "bg-blue-200 text-blue-800";
        case "completed": return "bg-green-200 text-green-800";
        case "failed": return "bg-red-200 text-red-800";
        default: return "bg-gray-200 text-gray-800";
    }
}

interface ContentPostRow {
    id: string;
    post_id: string;
    account_username: string;
    publish_time: string | null;
    views: number;
    processing_status: string;
    platform: string;
}

function formatDate(date: Date | null) {
    if (!date) return "";
    return date.toLocaleDateString();
}

function platformBadge(platform: string) {
    if (platform === "instagram") {
        return "border-pink-500 text-pink-600";
    }
    if (platform === "tiktok") {
        return "border-black text-black";
    }
    return "border-gray-300 text-gray-600";
}

export default function ContentTable() {
    const [rows, setRows] = React.useState<ContentPostRow[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [startDate, setStartDate] = React.useState<Date | undefined>();
    const [endDate, setEndDate] = React.useState<Date | undefined>();
    const [startOpen, setStartOpen] = React.useState(false);
    const [endOpen, setEndOpen] = React.useState(false);

    // Debounce search
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(handler);
    }, [search]);

    React.useEffect(() => {
        let ignore = false;
        async function fetchData() {
            setLoading(true);
            const supabase = createClient();
            let query = supabase
                .from("content_posts")
                .select("id,post_id,account_username,publish_time,views,processing_status,platform", { count: "exact" })
                .order("publish_time", { ascending: false });
            if (debouncedSearch) {
                query = query.ilike("post_id", `%${debouncedSearch}%`);
            }
            if (startDate) {
                query = query.gte("publish_time", startDate.toISOString());
            }
            if (endDate) {
                // Add 1 day to endDate to make the filter inclusive
                const inclusiveEnd = new Date(endDate);
                inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);
                query = query.lt("publish_time", inclusiveEnd.toISOString());
            }
            query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
            const { data, count } = await query;
            if (!ignore) {
                setRows((data as ContentPostRow[]) || []);
                setTotal(count || 0);
                setLoading(false);
            }
        }
        fetchData();
        return () => { ignore = true; };
    }, [page, debouncedSearch, startDate, endDate]);

    return (
        <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-4 gap-2">
                <Input
                    className="max-w-xs"
                    placeholder="Search by Post ID..."
                    aria-label="Search by Post ID"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                />
                <div className="flex items-center gap-2">
                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-36 justify-between font-normal"
                                onClick={() => setStartOpen(true)}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? formatDate(startDate) : "Start Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={date => {
                                    setStartDate(date ?? undefined);
                                    setPage(0);
                                    setStartOpen(false);
                                }}
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-36 justify-between font-normal"
                                onClick={() => setEndOpen(true)}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? formatDate(endDate) : "End Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={date => {
                                    setEndDate(date ?? undefined);
                                    setPage(0);
                                    setEndOpen(false);
                                }}
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-background">
                <Table className="min-w-full text-sm">
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead className="px-4 py-3">Post ID</TableHead>
                            <TableHead className="px-4 py-3">Username</TableHead>
                            <TableHead className="px-4 py-3">Status</TableHead>
                            <TableHead className="px-4 py-3">Publish Time</TableHead>
                            <TableHead className="px-4 py-3">Platform</TableHead>
                            <TableHead className="px-4 py-3 text-right">Views</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">No data</TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="px-4 py-2">
                                        <Link href={`/dashboard/${row.id}`} className="underline text-primary hover:text-primary/80">
                                            {row.post_id}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {row.account_username}
                                    </TableCell>
                                    <TableCell className="px-4 capitalize py-2">
                                        <Badge className={statusColor(row.processing_status)}>
                                            {row.processing_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        {row.publish_time ? formatDate(new Date(row.publish_time)) : ""}
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        <span className={`border rounded px-2 py-0.5 text-xs font-medium capitalize ${platformBadge(row.platform)}`}>
                                            {row.platform}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-right">
                                        {row.views}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        aria-label="Previous page"
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <span className="text-sm">
                        Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={loading || (page + 1) * PAGE_SIZE >= total}
                        aria-label="Next page"
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
} 