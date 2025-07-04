'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Download, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePDFGenerator } from '@/utils/pdfGenerator';

// Types for content_ideas and content_inspiration
interface ContentIdea {
    id: string;
    inspiration_id: string;
    title: string;
    description: string;
    hook?: string;
    visual_style?: string;
    content_angle?: string;
    target_audience?: string;
    predicted_performance_score?: number;
    rationale?: string;
    content_type?: string;
    platform?: string;
    tags?: string[] | Record<string, unknown> | null;
    is_starred?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface ContentInspiration {
    id: string;
    title: string;
    description: string;
    keywords?: string[];
    sources?: string[];
    final_score?: number;
    created_at?: string;
    [key: string]: unknown;
}

export default function ContentIdeaDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [idea, setIdea] = useState<ContentIdea | null>(null);
    const [inspiration, setInspiration] = useState<ContentInspiration | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStarred, setIsStarred] = useState(false);
    const [showInspirationDialog, setShowInspirationDialog] = useState(false);
    const supabase = createClient();
    const { generatePDF, isGenerating, error: pdfError } = usePDFGenerator();

    useEffect(() => {
        if (!id) {
            console.log('No id');
            return;
        }
        async function fetchData() {
            setLoading(true);
            setError(null);
            // Fetch content_ideas row
            const { data: ideaData, error: ideaError } = await supabase
                .from('content_ideas')
                .select('*')
                .eq('id', id)
                .single();
            console.log(ideaData);

            if (ideaError || !ideaData) {
                setError('Idea not found');
                setLoading(false);
                return;
            }
            setIdea(ideaData);
            setIsStarred(ideaData.is_starred);
            // Fetch linked inspiration
            const { data: inspData, error: inspError } = await supabase
                .from('content_inspiration')
                .select('*')
                .eq('id', ideaData.inspiration_id)
                .single();
            if (inspError || !inspData) {
                setError('Inspiration not found');
                setLoading(false);
                return;
            }
            console.log(inspData);
            setInspiration(inspData);
            setLoading(false);
        }
        fetchData();
    }, [id]);

    const handleStarClick = async () => {
        if (!idea) return;
        try {
            await fetch('/api/v1/ideas/star', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ideaId: idea.id,
                    isStarred: !isStarred,
                }),
            });
            setIsStarred(prev => !prev)
            console.log("Star updated")
        } catch (err) {
            setError('Failed to update star status');
            console.error(err);
        }
    }

    const handleDownloadPDF = async () => {
        if (!idea) return;
        const success = await generatePDF(idea, {
            filename: `${idea.title?.replace(/[^a-z0-9]/gi, '_') || 'content-idea'}.pdf`,
            logoUrl: '/Final Round AI.svg',
            includeScore: true,
            includeRationale: true,
            includeTags: true
        });
        if (success) {
            console.log('PDF generated successfully');
        } else {
            console.error('PDF generation failed:', pdfError);
        }
    };

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader title="Trend Analysis" />
                    <div className="flex items-center justify-center h-[80vh]">
                        <span className="text-lg font-semibold">Loading...</span>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }
    if (error) {
        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader title="Trend Analysis" />
                    <div className="p-8 text-red-500">{error}</div>
                </SidebarInset>
            </SidebarProvider>
        );
    }
    if (!idea || !inspiration) {
        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader title="Trend Analysis" />
                    <div className="p-8 text-muted-foreground">No data found.</div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Trend Analysis" />
                <div className='relative'>
                    <div className="max-w-5xl mx-auto p-6">
                        <div className='flex items-center gap-2 mb-2 justify-between'>
                            <div className='flex items-center gap-2'>
                                <h1 className="text-2xl font-bold">{idea.title}</h1>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button variant="ghost2" size="sm" onClick={handleStarClick}>
                                    <Star color={isStarred ? '#EED202' : '#3d3d3d'} fill={isStarred ? '#EED202' : 'transparent'} className='w-4 h-4' />
                                </Button>
                                <Button 
                                    variant="ghost2" 
                                    size="sm" 
                                    onClick={handleDownloadPDF} 
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <span className="w-4 h-4 animate-spin rounded-full border-2 border-b-transparent border-gray-600" />
                                    ) : (
                                        <Download className='w-4 h-4'/>
                                    )}
                                </Button>
                                {pdfError && <div className="text-red-500 text-xs ml-2">{pdfError}</div>}
                            </div>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <Badge variant="outline" className='capitalize'>{idea.platform}</Badge>
                            <Badge variant="secondary">{idea.content_type}</Badge>
                        </div>
                        <div className="mb-6">
                            <div className="text-muted-foreground mb-2">Created: {idea.created_at ? new Date(idea.created_at).toLocaleString() : '-'}</div>
                            <div className="mb-2"><span className="font-semibold">Description:</span> {idea.description}</div>
                            {(idea.visual_style || idea.hook) && <div className='bg-[#fafafa] border-2 border-dashed p-3 rounded-lg'>
                                {idea.hook && <div className="mb-2"><span className="font-semibold">Hook:</span> {idea.hook}</div>}
                                {idea.visual_style && <div className=""><span className="font-semibold">Visual Style:</span> {idea.visual_style}</div>}
                            </div>}
                            {idea.content_angle && <div className="my-2"><span className="font-semibold">Content Angle:</span> {idea.content_angle}</div>}
                            {idea.target_audience && <div className="mb-2"><span className="font-semibold">Target Audience:</span> {idea.target_audience}</div>}
                            {idea.predicted_performance_score !== undefined && <div className="px-4 py-2 border bg-primary/10 rounded-full absolute top-4 right-4"><div className="text-2xl font-bold text-primary text-center">{idea.predicted_performance_score}</div><div className="font-semibold text-center">Score</div> </div>}
                            {idea.rationale && <div className="mb-2"><span className="font-semibold">Rationale:</span> {idea.rationale}</div>}
                            {idea.tags && Array.isArray(idea.tags) && idea.tags.length > 0 && (
                                <div className="mb-2"> {idea.tags.map((tag: string, i: number) => <Badge key={i} className="ml-1">{tag.startsWith('#') ? tag : `#${tag}`}</Badge>)}</div>
                            )}
                        </div>
                        <div className='flex justify-end'>
                            <Button variant="outline" size="sm" className='text-gray-700 cursor-pointer' onClick={() => setShowInspirationDialog(true)}>
                                View Inspiration Details
                            </Button>
                        </div>
                        <hr className="my-6" />
                        <h2 className="text-xl font-semibold mb-2">Similar Ideas</h2>
                    </div>
                    <Dialog open={showInspirationDialog} onOpenChange={setShowInspirationDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Inspiration Details <Badge className="m-1">{inspiration.final_score}</Badge></DialogTitle>
                                <DialogDescription>
                                    <div className="mb-2"><span className="font-semibold">Title:</span> {inspiration.title}</div>
                                    <div className="mb-2"><span className="font-semibold">Description:</span> {inspiration.description}</div>
                                    {inspiration.keywords && Array.isArray(inspiration.keywords) && inspiration.keywords.length > 0 && (
                                        <div className="mb-2"><span className="font-semibold">Keywords:</span> {inspiration.keywords.map((kw: string, i: number) => <Badge key={i} className="m-1 bg-accent text-gray-700">{kw}</Badge>)}</div>
                                    )}
                                    {inspiration.sources && Array.isArray(inspiration.sources) && inspiration.sources.length > 0 && (
                                        <div className="mb-2"><span className="font-semibold">Sources:</span> {inspiration.sources.map((src: string, i: number) => <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600">Source {i + 1}</a>)}</div>
                                    )}
                                    <div className="mb-2"><span className="font-semibold">Created At:</span> {inspiration.created_at ? new Date(inspiration.created_at).toLocaleString() : '-'}</div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
