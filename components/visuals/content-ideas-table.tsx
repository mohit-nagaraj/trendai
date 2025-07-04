import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

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
  tags?: any;
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
        <TableHeader>
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
                <TableCell>{idea.platform ? <Badge>{idea.platform}</Badge> : '-'}</TableCell>
                <TableCell>{idea.content_type || '-'}</TableCell>
                <TableCell>{idea.created_at ? new Date(idea.created_at).toLocaleString() : '-'}</TableCell>
                <TableCell>
                  <Switch checked={!!idea.is_starred} disabled className="pointer-events-none" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 