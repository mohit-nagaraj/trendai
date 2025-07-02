"use client";

import React, { useEffect, useState, type FC } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { platformBadge, statusColor } from "@/lib/badge-colors";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRightIcon, ChevronsUp, Eye, Heart, MessageCircle, Send, Share, User, Zap } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false });

// Types for Supabase data (replace with generated types if available)
type ContentPost = Record<string, any>;
type ContentAnalysis = Record<string, any>;

const DashboardPage: FC = () => {
    const params = useParams();
    const id = params?.id as string;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [post, setPost] = useState<ContentPost | null>(null);
    const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
    const [mediaOpen, setMediaOpen] = useState(false);
    const [activeMedia, setActiveMedia] = useState<{ url: string; type: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const supabase = createClient();
                // Fetch content_posts
                const { data: postData, error: postError } = await supabase
                    .from("content_posts")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (postError) throw postError;
                console.log(postData);
                setPost(postData);

                // Fetch content_analysis by content_id
                const { data: analysisData, error: analysisError } = await supabase
                    .from("content_analysis")
                    .select("*")
                    .eq("content_id", id)
                    .single();
                if (analysisError) throw analysisError;
                console.log(analysisData);
                setAnalysis(analysisData);
            } catch (err: any) {
                setError((err as Error).message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) {
        return (
            <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Detailed Post Analysis" />
            <div className="flex items-center justify-center h-[80vh]">
                <span className="text-lg font-semibold">Loading...</span>
            </div>
            </SidebarInset>
            </SidebarProvider>
        );
    }
    if (error) {
        return (
            <div className="flex items-center justify-center h-[80vh] text-red-500">
                <span className="text-lg font-semibold">{error}</span>
            </div>
        );
    }
    if (!post || !analysis) {
        return (
            <div className="flex items-center justify-center h-[80vh] text-gray-500">
                <span className="text-lg font-semibold">No data found.</span>
            </div>
        );
    }

    // Helper for array fields (json/text[])
    const renderList = (arr: unknown) => {
        if (!arr) return null;
        if (Array.isArray(arr)) return arr.map((v, i) => <li key={i}>{v}</li>);
        if (typeof arr === "string") {
            try {
                const parsed = JSON.parse(arr);
                if (Array.isArray(parsed)) return parsed.map((v, i) => <li key={i}>{v}</li>);
            } catch {
                return <li>{String(arr)}</li>;
            }
        }
        return <li>{String(arr)}</li>;
    };

    function hookScoreColor(score: number | undefined) {
        if (typeof score !== "number") return "bg-gray-200 text-gray-700";
        if (score < 4) return "bg-red-100 text-red-700";
        if (score < 8) return "bg-yellow-100 text-yellow-800";
        return "bg-green-100 text-green-800";
    }

    // Gauge value (performance_category based)
    function getGaugeValueFromCategory(category?: string): number {
        if (!category) return 0;
        if (category === "low") return 30 + Math.floor(Math.random() * 5) - 2; // 28-32
        if (category === "medium") return 60 + Math.floor(Math.random() * 5) - 2; // 58-62
        if (category === "high") return 90 + Math.floor(Math.random() * 5) - 2; // 88-92
        return 0;
    }
    const gaugeValue = getGaugeValueFromCategory(analysis.performance_category);
    const gaugePercent = gaugeValue;

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Detailed Post Analysis" />
                <div className="p-6 bg-[#fff7f3] min-h-screen">
                    <div className="flex gap-2 mb-2 items-center">
                        <h2 className="text-2xl text-primary mb-1">
                            Post #{post.post_id}
                        </h2>
                        {post.platform && (
                            <span className={`border rounded px-2 py-0.5 text-xs font-medium capitalize ${platformBadge(post.platform)}`}>
                                {post.platform}
                            </span>
                        )}
                        <Badge className={statusColor(post.processing_status)}>
                            {post.processing_status}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 mb-2 items-center">
                            <div className="text-sm text-slate-700 mb-1">
                                Topics:
                            </div>
                            {analysis.content_themes.map((theme: string) => (
                                <Badge key={theme} className="text-xs bg-slate-100 text-slate-700">
                                    #{theme}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 mb-2 items-center">
                            <div className="text-sm text-slate-700 mb-1">
                                Posted on:
                                <Badge className="text-xs bg-slate-100 text-slate-700">
                                    {post.publish_time ? new Date(post.publish_time).toLocaleString() : "-"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto grid grid-cols-12 gap-6">
                        {/* Left: Main Content */}
                        <div className="col-span-9 space-y-6">
                            {/* Header */}

                            {/* Metrics Row */}
                            <div className="grid grid-cols-3 gap-4 rounded-lg p-4 text-center bg-transparent border border-primary/50">
                                <div>
                                    <div className="text-3xl font-bold">{post.engagement_rate?.toFixed(2) ?? "-"}</div>
                                    <div className="text-xs text-gray-500">Engagement Rate</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{post.viral_coefficient?.toFixed(2) ?? "-"}</div>
                                    <div className="text-xs text-gray-500">Viral Coefficient</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{post.performance_score?.toFixed(2) ?? "-"}</div>
                                    <div className="text-xs text-gray-500">Performance Score</div>
                                </div>
                            </div>

                            {/* Key Insights */}
                            <div className="bg-white rounded-lg p-4 border border-orange-100">
                                <h3 className="font-semibold text-primary mb-2">Key Insights</h3>
                                <ul className="list-disc pl-5 text-sm text-gray-700">
                                    {renderList(analysis.key_insights)}
                                </ul>
                            </div>

                            {/* Visual Analysis */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-orange-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-primary mb-2">Key Visual Elements</h4>
                                        <Badge className={`${hookScoreColor(analysis.visual_appeal_score)} text-xs`}>
                                            Score: {analysis.visual_appeal_score?.toFixed(1) ?? "-"}
                                        </Badge>
                                    </div>
                                    <ul className="list-disc pl-5 text-sm text-gray-700">
                                        {renderList(analysis.key_visual_elements)}
                                    </ul>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-orange-100">
                                    <h4 className="font-semibold text-primary mb-2">Visual Suggestions</h4>
                                    <ul className="list-disc pl-5 text-sm text-gray-700">
                                        {renderList(analysis.visual_suggestions)}
                                    </ul>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-orange-100">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-primary mb-2">Hook Analysis</h3>
                                        <Badge className={`${hookScoreColor(analysis.hook_effectiveness_score)} text-xs`}>
                                            Score: {analysis.hook_effectiveness_score?.toFixed(1) ?? "-"}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">
                                        <strong>Hook Reasoning:</strong>
                                        <div>{analysis.hook_reasoning}</div>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">
                                        <strong>Hook Suggestions:</strong>
                                        <ul className="list-disc pl-5">
                                            {renderList(analysis.hook_suggestions)}
                                        </ul>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-orange-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-[#006200] mb-2">Optimization Suggestions</h3>
                                        <span className="bg-[#006200]/10 border flex items-center gap-1 border-[#006200] text-[#006200] text-xs px-2 py-0.5 rounded-md">
                                            {analysis.optimization_suggestions.length} Suggestions <ChevronsUp className="w-4 h-4 text-[#006200]" />
                                        </span>
                                    </div>
                                    <ul className="list-disc pl-5 text-sm text-gray-700">
                                        {renderList(analysis.optimization_suggestions)}
                                    </ul>
                                </div>
                            </div>

                        </div>

                        {/* Right: Sidebar */}
                        <div className="col-span-3 space-y-6">
                            
                            {/* Hook Analysis */}
                            <div className="bg-white rounded-lg p-4 border border-orange-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                        <User className="w-8 h-8 bg-gray-100 rounded-full p-2" />
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-semibold text-gray-800">{post.account_name}</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs ">
                                                @{post.account_username || "username"}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={post.permalink} target="_blank" rel="noopener noreferrer">
                                        <div className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors cursor-pointer border border-primary rounded-md p-1">
                                            <ArrowUpRightIcon className="w-4 h-4" />
                                        </div>
                                    </Link>
                                </div>
                                {/* Video?Image should come in here */}
                                {post.post_link ? (
                                    (() => {
                                        const isVideo = post.post_link.endsWith('.mp4');
                                        const mediaType = isVideo ? 'video' : 'image';
                                        return (
                                            <>
                                                <div
                                                    className="w-full flex justify-center mb-2 cursor-pointer group"
                                                    onClick={() => {
                                                        setActiveMedia({ url: post.post_link, type: mediaType });
                                                        setMediaOpen(true);
                                                    }}
                                                >
                                                    {isVideo ? (
                                                        <video
                                                            src={post.post_link}
                                                            controls={false}
                                                            className="rounded-lg max-h-64 w-auto max-w-full shadow group-hover:brightness-75 transition"
                                                            poster={post.thumbnail_url || undefined}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={post.post_link}
                                                            alt="Post visual"
                                                            className="rounded-lg max-h-64 w-auto max-w-full shadow group-hover:brightness-75 transition"
                                                        />
                                                    )}
                                                </div>
                                                <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
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
                                            </>
                                        );
                                    })()
                                ) : (
                                    <div className="w-full flex justify-center mb-2 text-gray-400 italic text-xs">No media available</div>
                                )}
                                <div className="flex justify-between px-4 gap-2 text-xs text-gray-600 my-2">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" /> {post.views ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart color="#EF4444" fill="#EF4444" strokeWidth={0} className="w-4 h-4" /> {post.likes ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageCircle color="#3B82F6" fill="#3B82F6" strokeWidth={0} className="w-4 h-4" /> {post.comments ?? 0}
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <Send color="#10B981" className="w-4 h-4" /> {post.shares ?? 0}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-700">
                                    <div>{post.description}</div>
                                </div>
                                <div className="text-xs text-gray-700">
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger >
                                                <div className="flex items-center cursor-pointer gap-1 text-[#aa9a22] text-sm hover:no-underline">
                                                    Engagement Drivers <Zap color="#EED202" fill="#EED202" strokeWidth={0} className="w-4 h-4" />
                                                </div></AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="list-disc pl-5">
                                                    {renderList(analysis.engagement_drivers)}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-60 h-35">
                                    <GaugeComponent
                                        value={gaugePercent}
                                        minValue={0}
                                        maxValue={100}
                                        arc={{
                                            subArcs: [
                                                { limit: 20, color: "#EA4228" },
                                                { limit: 40, color: "#F58B19" },
                                                { limit: 60, color: "#F5CD19" },
                                                { limit: 100, color: "#5BE12C" },
                                            ],
                                        }}
                                        labels={{
                                            valueLabel: {
                                                formatTextValue: (v: any) => `${v}%`,
                                                style: { fontSize: 32, fill: "#333" },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            {/* Visual/Brand/Target Scores */}
                            <div className="bg-white rounded-lg p-4 border border-orange-100 flex flex-col items-center">
                                <div className="flex gap-4 mb-2">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xl font-bold text-primary">{analysis.visual_hook_strength ?? "-"}</span>
                                        <span className="text-xs text-gray-500">Hook Strength</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xl font-bold text-primary">{analysis.brand_consistency_score ?? "-"}</span>
                                        <span className="text-xs text-gray-500">Brand Consistency</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xl font-bold text-primary">{analysis.target_audience_alignment_score ?? "-"}</span>
                                        <span className="text-xs text-gray-500">Target Audience Alignment</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-700 mt-2">
                                    <strong>Reason:</strong>
                                    <div>{analysis.target_audience_reasoning}</div>
                                </div>
                            </div>

                            {/* Profile & Stats */}

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardPage;
