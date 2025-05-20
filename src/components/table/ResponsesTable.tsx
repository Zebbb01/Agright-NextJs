// src/components/table/ResponsesTable.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Trash2 } from 'lucide-react';

interface Response {
  id: number;
  formId: number;
  userId: number;
  values: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ResponsesTableProps {
  // Make formId and setIsCreating optional, as they won't always be passed (e.g., on dashboard)
  formId?: string;
  setIsCreating?: (isCreating: boolean) => void;
  isAdmin?: boolean; // Add the isAdmin prop
}

// Destructure isAdmin from props
export default function ResponsesTable({ formId, setIsCreating, isAdmin }: ResponsesTableProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/routes/form/response`; // Default URL to fetch ALL responses

      // If formId is provided, fetch responses for that specific form
      if (formId) {
        url = `/api/routes/form/response/by-form/${formId}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error fetching responses: ${res.statusText}`);
      }
      const data = await res.json();
      setResponses(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId: number) => {
    if (!window.confirm("Are you sure you want to delete this response?")) {
      return;
    }
    try {
      const res = await fetch(`/api/routes/form/response/${responseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        try {
          const errorJson = JSON.parse(errorBody);
          throw new Error(`Failed to delete response: ${errorJson.details || errorJson.error || res.statusText}`);
        } catch (parseError) {
          throw new Error(`Failed to delete response: ${res.statusText}. Server response: ${errorBody}`);
        }
      }

      fetchResponses(); // Re-fetch responses to update the table
    } catch (error: any) {
      console.error("Error deleting response:", error);
      alert(`Error deleting response: ${error.message}`);
    }
  };

  useEffect(() => {
    // This useEffect will run when the component mounts and when formId changes.
    // If formId is undefined (on the dashboard), it will call fetchResponses,
    // which will then use the default '/api/routes/form/response' URL.
    fetchResponses();
  }, [formId]); // Depend on formId, so if it changes, data is re-fetched

  const handleRefresh = () => {
    fetchResponses();
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading responses...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  if (responses.length === 0) {
    return (
      <div className="text-center text-gray-500">
        {/* Dynamic message based on whether a specific formId is being viewed */}
        <p>No responses found {formId ? `for this form` : `yet`}.</p>
        <Button onClick={handleRefresh} className="mt-4 flex items-center mx-auto gap-2">
          <RefreshCcw size={16} /> Refresh Responses
        </Button>
      </div>
    );
  }

  // Ensure allFieldLabels is robust enough for multiple forms with varying fields
  const allFieldLabels = Array.from(
    new Set(responses.flatMap((res) => Object.keys(res.values)))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCcw size={16} /> Refresh
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Response ID</TableHead><TableHead>User</TableHead>{allFieldLabels.map((label) => (<TableHead key={label}>{label}</TableHead>))}<TableHead>Submitted At</TableHead><TableHead>Last Updated</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell className="font-medium">{response.id}</TableCell><TableCell>{response.user?.name || response.userId}</TableCell>
              {allFieldLabels.map((label) => (<TableCell key={label}>{Array.isArray(response.values[label]) ? response.values[label].join(', ') : response.values[label]?.toString() || '-'}</TableCell>))}
              <TableCell>{new Date(response.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(response.updatedAt).toLocaleString()}</TableCell>
              <TableCell>{response.deletedAt ? `Deleted: ${new Date(response.deletedAt).toLocaleString()}` : 'Active'}</TableCell>
              <TableCell>
                {/* Only show delete button if isAdmin is true AND the response is not deleted */}
                {isAdmin && !response.deletedAt && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteResponse(response.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}