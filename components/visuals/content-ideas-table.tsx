import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeftIcon, ChevronRightIcon, Star } from 'lucide-react';
import { platformBadge } from '@/lib/badge-colors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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

const PAGE_SIZE = 20;

interface ContentIdeasTableProps {
  data: ContentIdea[];
  loading?: boolean;
  onRowClick?: (idea: ContentIdea) => void;
}

export function ContentIdeasTable({ data, loading = false, onRowClick }: ContentIdeasTableProps) {
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [starredOnly, setStarredOnly] = React.useState(false);
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset to first page on filter/search change
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, starredOnly]);

  // Filter and paginate data
  const filtered = React.useMemo(() => {
    let filtered = data;
    if (debouncedSearch) {
      filtered = filtered.filter(idea => idea.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    if (starredOnly) {
      filtered = filtered.filter(idea => idea.is_starred);
    }
    return filtered;
  }, [data, debouncedSearch, starredOnly]);

  const total = filtered.length;
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="mt-4" >
      <div className="flex items-center justify-between mb-4 gap-2 px-2 pt-2">
        <Input
          className="max-w-xs"
          placeholder="Search by Title..."
          aria-label="Search by Title"
          value={search}
          onChange={e => { setSearch(e.target.value); }}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="starred" className="text-sm">Starred Only</label>
          <Switch id="starred" checked={starredOnly} onCheckedChange={setStarredOnly} />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-background mt-4"> 
      <Table className="min-w-full text-sm">
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
          ) : paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">No ideas found.</TableCell>
            </TableRow>
          ) : (
            paginated.map((idea) => (
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
                  <Star color={idea.is_starred ? '#EED202' : '#1a1919'} fill={idea.is_starred ? '#EED202' : 'transparent'} strokeWidth={idea.is_starred ? 0 : 1} className='w-4 h-4' />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 px-2 pb-2">
        <span className="text-sm text-muted-foreground">
          Showing {total === 0 ? 0 : page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
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