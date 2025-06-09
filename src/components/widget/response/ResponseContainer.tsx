// src/components/widget/response/ResponseContainer.tsx
"use client";

import { useState } from "react";
import ResponsePanel from "./ResponsePanel";
import ResponsesTable from "../../data/ResponsesTable";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
// Import the hook so we can use the refresh and other logic here
import { useResponsesTable } from "@/hooks/form/useResponsesTable";

export default function ResponseContainer({ formId }: { formId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  // ADD THESE: State for viewing/editing
  const [viewingResponseId, setViewingResponseId] = useState<string | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const { user, isLoading } = useAuth();

  // Call the hook to get table data and actions
  const {
    responses,
    paginatedResponses,
    currentPage,
    totalPages,
    loading,
    error,
    handlePreviousPage,
    handleNextPage,
    handleRefreshResponses,
    handleDeleteResponse,
    allFieldLabels,
  } = useResponsesTable({ formId });

  // ADD THIS: Handle view response
  const handleViewResponse = (responseId: string) => {
    setViewingResponseId(responseId);
    setEditingResponseId(null); // Ensure not in edit mode if viewing
    setIsCreating(false); // Ensure not in create mode
  };

  // ADD THIS: Handle edit response
  const handleEditResponse = (responseId: string) => {
    setEditingResponseId(responseId);
    setViewingResponseId(null); // Ensure not in view mode if editing
    setIsCreating(false); // Ensure not in create mode
  };

  // ADD THIS: Handle closing the panel
  const handleClosePanel = () => {
    setViewingResponseId(null);
    setEditingResponseId(null);
    setIsCreating(false);
    handleRefreshResponses(); // Refresh data after closing
  };

  if (!formId) {
    return (
      <p className="text-center text-gray-500">
        Please select a form to view or add responses.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-red-500">
        You must be logged in to add a response.
      </p>
    );
  }

  const isAdmin = user.role?.name.toLowerCase() === "admin";

  return (
    <div className="space-y-6">
      {/* Conditionally render ResponsePanel for creating, viewing, or editing */}
      {isCreating || viewingResponseId || editingResponseId ? (
        <div className="flex justify-center mx-auto mb-4">
          <ResponsePanel
            setIsOpen={handleClosePanel} // Use the new close handler
            formId={formId}
            userId={user.id}
            onResponseAdded={handleRefreshResponses} // Refresh when a response is added
            responseId={viewingResponseId || editingResponseId} // Pass the response ID if viewing/editing
            isReadOnly={!!viewingResponseId} // Set readOnly based on viewingResponseId
          />
        </div>
      ) : (
        <>
          {/* Header Row with Refresh on left and Add Response on right */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handleRefreshResponses}
              className="flex items-center gap-2"
            >
              <RefreshCcw size={16} /> Refresh
            </Button>

            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Response
            </Button>
          </div>

          {/* Pass table data as props */}
          <ResponsesTable
            responses={responses}
            paginatedResponses={paginatedResponses}
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            error={error}
            allFieldLabels={allFieldLabels}
            isAdmin={isAdmin}
            handleDeleteResponse={handleDeleteResponse}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            handleViewResponse={handleViewResponse} // Pass new view handler
            handleEditResponse={handleEditResponse} // Pass new edit handler
          />
        </>
      )}
    </div>
  );
}