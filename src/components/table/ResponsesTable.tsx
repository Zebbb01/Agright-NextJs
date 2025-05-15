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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { responses } from '@/data/response';

const ITEMS_PER_PAGE = 10;

type ResponsesTableProps = {
  setIsCreating?: (open: boolean) => void;
  showAddButton?: boolean;
  formId?: string | null;
  isAdmin?: boolean;
};

export default function ResponsesTable({
  setIsCreating,
  showAddButton = false,
  formId,
  isAdmin = false,
}: ResponsesTableProps) {
  const filteredResponses = isAdmin
    ? responses
    : responses.filter((r) => r.formId === formId);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);

  const paginated = filteredResponses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Dynamically get column headers from first response, excluding Latitude and Longitude
  const allKeys = filteredResponses[0]
    ? Object.keys(filteredResponses[0].values).filter(
        (key) => key !== 'Latitude' && key !== 'Longitude'
      )
    : [];

  const hasLocationColumn = filteredResponses.some(
    (r) => 'Latitude' in r.values && 'Longitude' in r.values
  );
    

  return (
    <div className="space-y-4">
      {showAddButton && setIsCreating && (
        <Button
          onClick={() => setIsCreating(true)}
          className="ml-auto flex items-center gap-2"
        >
          <Plus size={16} /> Add Response
        </Button>
      )}

      <Table>
        <TableHeader>
        <TableRow>
          {allKeys.map((key) => (
            <TableHead key={key}>{key}</TableHead>
          ))}
          {hasLocationColumn && <TableHead>Location(Lat,Long)</TableHead>}
        </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((r, i) => (
            <TableRow key={i}>
              {allKeys.map((key) => {
                const value = r.values[key as keyof typeof r.values];
                if (key === 'Upload Photo') {
                  return (
                    <TableCell key={key}>
                      <a
                        href={`/${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline block"
                      >
                        {String(value).split('/').pop()}
                      </a>
                    </TableCell>
                  );
                } else if (key === 'Block' && Array.isArray(value)) {
                  return (
                    <TableCell key={key}>
                      {value.sort((a, b) => +a - +b).join(', ')}
                    </TableCell>
                  );
                } else {
                  return <TableCell key={key}>{String(value)}</TableCell>;
                }
              })}

              {/* Combine Latitude and Longitude into a single Location cell */}
              {hasLocationColumn && 'Latitude' in r.values && 'Longitude' in r.values ? (
                <TableCell>
                  {r.values['Latitude']}, {r.values['Longitude']}
                </TableCell>
              ) : hasLocationColumn ? (
                <TableCell />
              ) : null}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={allKeys.length + 1}>
              Total Responses: {filteredResponses.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {totalPages > 1 && (
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
      )}
    </div>
  );
}
