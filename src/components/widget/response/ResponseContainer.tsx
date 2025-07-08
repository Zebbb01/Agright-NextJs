// src/components/containers/ResponseContainer.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import ResponsePanel from "./ResponsePanel";
import ResponsesTable from "../../data/ResponsesTable";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { useResponsesTable } from "@/hooks/form/useResponsesTable";

export default function ResponseContainer({ formId }: { formId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingResponseId, setViewingResponseId] = useState<string | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  const { user, isLoading: isAuthLoading } = useAuth();

  const {
    responses,
    totalPages,
    loading,
    error,
    handleRefreshResponses,
    handleDeleteResponse,
    allFieldLabels,
    isDeleting,
  } = useResponsesTable({
    formId,
    currentPage,
    searchTerm,
    visibleColumnIds,
  });

  // Handle view response
  const handleViewResponse = useCallback((responseId: string) => {
    setViewingResponseId(responseId);
    setEditingResponseId(null);
    setIsCreating(false);
  }, []);

  // Handle edit response
  const handleEditResponse = useCallback((responseId: string) => {
    setEditingResponseId(responseId);
    setViewingResponseId(null);
    setIsCreating(false);
  }, []);

  // Handle closing the panel
  const handleClosePanel = useCallback(() => {
    setViewingResponseId(null);
    setEditingResponseId(null);
    setIsCreating(false);
    handleRefreshResponses();
  }, [handleRefreshResponses]);

  // Handlers for pagination
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Handle filter changes from the DataTable
  const handleFilterChange = useCallback(
    ({ searchTerm, visibleColumns }: { searchTerm: string; visibleColumns: string[] }) => {
      setSearchTerm(searchTerm);
      setVisibleColumnIds(visibleColumns);
      // Reset to first page when filters change
      setCurrentPage(1);
    },
    []
  );

  // Initialize visible columns when field labels are available
  useEffect(() => {
    if (allFieldLabels.length > 0 && visibleColumnIds.length === 0) {
      // Set default visible columns (excluding responseId and status as per requirement)
      const defaultVisible = [
        "userName",
        ...allFieldLabels.slice(0, 5), // Take first 5 dynamic fields
        "submittedAt",
      ].slice(0, 7); // Ensure we don't exceed 7 columns
      
      setVisibleColumnIds(defaultVisible);
    }
  }, [allFieldLabels, visibleColumnIds]);

  if (!formId) {
    return (
      <p className="text-center text-gray-500">
        Please select a form to view or add responses.
      </p>
    );
  }

  if (isAuthLoading) {
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
            setIsOpen={handleClosePanel}
            formId={formId}
            userId={user.id}
            onResponseAdded={handleRefreshResponses}
            responseId={viewingResponseId || editingResponseId}
            isReadOnly={!!viewingResponseId}
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

          {/* ResponsesTable with enhanced functionality */}
          <ResponsesTable
            responses={responses}
            loading={loading}
            error={error}
            allFieldLabels={allFieldLabels}
            isAdmin={isAdmin}
            handleDeleteResponse={handleDeleteResponse}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            handleViewResponse={handleViewResponse}
            handleEditResponse={handleEditResponse}
            isDeleting={isDeleting}
            currentPage={currentPage}
            totalPages={totalPages}
            searchTerm={searchTerm}
            visibleColumnIds={visibleColumnIds}
            onFilterChange={handleFilterChange}
          />
        </>
      )}
    </div>
  );
}