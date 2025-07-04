import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { platformBadge } from '@/lib/badge-colors';

export type ContentIdea = {
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
};

interface ContentIdeasTableProps {
  data: ContentIdea[];
  loading?: boolean;
  onRowClick?: (idea: ContentIdea) => void;
}

export function ContentIdeasTable({ data, loading = false, onRowClick }: ContentIdeasTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Starred</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">No ideas found.</TableCell>
            </TableRow>
          ) : (
            data.map((idea) => (
              <TableRow
                key={idea.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => onRowClick?.(idea)}
              >
                <TableCell className="font-medium">{idea.title}</TableCell>
                <TableCell>{idea.platform ? <Badge className={platformBadge(idea.platform)+' bg-transparent capitalize'}>{idea.platform}</Badge> : '-'}</TableCell>
                <TableCell>{idea.content_type || '-'}</TableCell>
                <TableCell>{idea.created_at ? new Date(idea.created_at).toLocaleString() : '-'}</TableCell>
                <TableCell>
                  <Star color={idea.is_starred ? '#EED202' : '#000'} fill={idea.is_starred ? '#EED202' : 'transparent'} strokeWidth={idea.is_starred ? 0 : 1} className='w-4 h-4' />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 