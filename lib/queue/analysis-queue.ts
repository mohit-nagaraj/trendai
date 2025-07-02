import { analyzeContentWithGemini, ContentPost } from "@/lib/ai/gemini-service";

interface QueueJob {
  id: string;
  contentId: string;
  priority: number;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

class AnalysisQueue {
  private queue: QueueJob[] = [];
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly RATE_LIMIT_DELAY = 2000; // 2 seconds between requests
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.startProcessing();
  }

  addJob(contentId: string, priority: number = 1): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const job: QueueJob = {
      id: jobId,
      contentId,
      priority,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: this.MAX_RETRIES,
    };
    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
    console.log(`Added job ${jobId} for content ${contentId} to analysis queue`);
    return jobId;
  }

  private startProcessing(): void {
    if (this.processingInterval) return;
    this.processingInterval = setInterval(async () => {
      if (this.processing || this.queue.length === 0) return;
      this.processing = true;
      const job = this.queue.shift();
      if (job) {
        await this.processJob(job);
      }
      this.processing = false;
    }, this.RATE_LIMIT_DELAY);
  }

  private async processJob(job: QueueJob): Promise<void> {
    const { createServiceClient } = await import("@/utils/supabase/service");
    try {
      console.log(`Processing job ${job.id} for content ${job.contentId}`);
      job.attempts++;
      const supabase = createServiceClient();
      // Update processing status
      await supabase
        .from("content_posts")
        .update({ processing_status: "processing" })
        .eq("id", job.contentId);
      // Get content post data
      const { data: contentPost, error: fetchError } = await supabase
        .from("content_posts")
        .select("*")
        .eq("id", job.contentId)
        .single();
      if (fetchError || !contentPost) {
        throw new Error(`Failed to fetch content post: ${fetchError?.message}`);
      }
      // Analyze with Gemini
      const startTime = Date.now();
      const analysisResult = await analyzeContentWithGemini(contentPost as ContentPost);
      const processingTime = Date.now() - startTime;
      // Store analysis results
      await supabase.from("content_analysis").insert({
        content_id: job.contentId,
        ai_insights: analysisResult,
        content_themes: analysisResult.content_themes,
        hook_effectiveness_score: analysisResult.hook_effectiveness.score,
        hook_reasoning: analysisResult.hook_effectiveness.reasoning,
        hook_suggestions: analysisResult.hook_effectiveness.suggestions,
        visual_hook_strength: analysisResult.visual_analysis?.hook_strength,
        visual_appeal_score: analysisResult.visual_analysis?.visual_appeal,
        brand_consistency_score: analysisResult.visual_analysis?.brand_consistency,
        key_visual_elements: analysisResult.visual_analysis?.key_visual_elements,
        visual_suggestions: analysisResult.visual_analysis?.visual_suggestions,
        engagement_drivers: analysisResult.engagement_drivers,
        target_audience_alignment_score: analysisResult.target_audience_alignment.score,
        target_audience_reasoning: analysisResult.target_audience_alignment.reasoning,
        performance_category: analysisResult.performance_category,
        key_insights: analysisResult.key_insights,
        optimization_suggestions: analysisResult.optimization_suggestions,
        processing_time_ms: processingTime,
        gemini_model_used: "gemini-2.5-pro",
        has_visual_analysis: !!contentPost.post_link,
      });
      // Update content post status
      await supabase
        .from("content_posts")
        .update({
          processing_status: "completed",
          ai_analysis_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.contentId);
      console.log(`Job ${job.id} completed successfully in ${processingTime}ms`);
    } catch (error) {
      console.error(`Job ${job.id} failed (attempt ${job.attempts}):`, error);
      const { createServiceClient } = await import("@/utils/supabase/service");
      const supabase = createServiceClient();
      if (job.attempts >= job.maxAttempts) {
        // Mark as failed after max retries
        await supabase
          .from("content_posts")
          .update({ processing_status: "failed" })
          .eq("id", job.contentId);
        console.error(`Job ${job.id} failed permanently after ${job.attempts} attempts`);
      } else {
        // Retry job
        job.priority = Math.max(1, job.priority - 1); // Lower priority for retries
        this.queue.unshift(job); // Add back to front for retry
        this.queue.sort((a, b) => b.priority - a.priority);
        await supabase
          .from("content_posts")
          .update({ processing_status: "pending" })
          .eq("id", job.contentId);
      }
    }
  }

  getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.queue.length,
      processing: this.processing,
    };
  }

  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

export const analysisQueue = new AnalysisQueue(); 