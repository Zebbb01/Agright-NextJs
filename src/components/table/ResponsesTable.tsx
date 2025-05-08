// src/components/table/ResponsesTable.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { responses } from '@/data/response';

const ITEMS_PER_PAGE = 15;

type ResponsesTableProps = {
  setIsCreating?: (open: boolean) => void;
  showAddButton?: boolean;
  formId?: string | null;
  isAdmin?: boolean;
};


export default function ResponsesTable({ setIsCreating, showAddButton = false }: ResponsesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(responses.length / ITEMS_PER_PAGE);
  const paginated = responses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      {showAddButton && setIsCreating && (
        <Button onClick={() => setIsCreating(true)} className="ml-auto flex items-center gap-2">
          <Plus size={16} /> Add Response
        </Button>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Encoder</TableHead>
            <TableHead>Farm</TableHead>
            <TableHead>Terrain</TableHead>
            <TableHead>Disease</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Blocks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.date}</TableCell>
              <TableCell>{r['encoder-name']}</TableCell>
              <TableCell>{r['farm-name']}</TableCell>
              <TableCell>{r.terrain}</TableCell>
              <TableCell>{r['types-of-diseases']}</TableCell>
              <TableCell>{r.latitude}, {r.longitude}</TableCell>
              <TableCell>
                <a
                  href={`/${r['upload-photo']}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline block"
                >
                  {r['upload-photo'].split('/').pop()}
                </a>
              </TableCell>
              <TableCell>{r.block.sort((a,b) => +a - +b).join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8}>Total Responses: {responses.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          <PaginationItem>
            Page {currentPage} of {totalPages}
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}