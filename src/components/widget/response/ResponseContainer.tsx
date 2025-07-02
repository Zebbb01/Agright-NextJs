// src/components/widget/response/ResponseContainer.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import ResponsePanel from "./ResponsePanel";
import ResponsesTable from "../../data/ResponsesTable";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { useResponsesTable } from "@/hooks/form/useResponsesTable"; // Correct path to your hook

export default function ResponseContainer({ formId }: { formId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingResponseId, setViewingResponseId] = useState<string | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);

  // State for search term and visible columns
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { user, isLoading: isAuthLoading } = useAuth();

  // Call the hook to get table data and actions, passing new filter parameters
  const {
    responses, // All responses (before client-side pagination/filtering in hook)
    paginatedResponses, // Responses after client-side search filtering and pagination
    totalPages, // Get totalPages from the hook
    loading,
    error,
    handleRefreshResponses,
    handleDeleteResponse,
    allFieldLabels,
    isDeleting,
  } = useResponsesTable({
    formId,
    searchTerm,
    // visibleColumnIds is primarily used for column rendering, not data filtering in the hook itself
    // so we pass it but it won't affect `filteredResponses` in the hook directly.
    visibleColumnIds,
    currentPage,
  });

  // Effect to set initial visible columns once allFieldLabels are available
  useEffect(() => {
    // Set initial visible columns based on allFieldLabels if not already set
    if (allFieldLabels.length > 0 && visibleColumnIds.length === 0) {
      // You might want to define which columns are visible by default
      // For now, let's make all of them visible if they are toggleable and have an ID.
      const defaultVisible = allFieldLabels.map(label => label);
      // Also include fixed columns you want to be visible by default
      const fixedDefaultVisible = ["responseId", "userName", "submittedAt", "status"];
      setVisibleColumnIds([...new Set([...fixedDefaultVisible, ...defaultVisible])]);
    }
  }, [allFieldLabels, visibleColumnIds]); // Only re-run if allFieldLabels or visibleColumnIds change

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

  // Handlers for pagination from ResponseContainer
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Handler for when DataTableControls' internal filter/search state changes
  const handleDataTableFilterChange = useCallback(
    ({
      searchTerm: newSearchTerm,
      visibleColumns: newVisibleColumnIds,
    }: {
      searchTerm: string;
      visibleColumns: string[];
    }) => {
      setSearchTerm(newSearchTerm);
      setVisibleColumnIds(newVisibleColumnIds);
      // When filters change, reset to the first page
      setCurrentPage(1);
    },
    []
  );

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

          {/* Pass table data as props */}
          <ResponsesTable
            responses={paginatedResponses} // Pass the paginated and filtered responses for display
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
            handleViewResponse={handleViewResponse}
            handleEditResponse={handleEditResponse}
            isDeleting={isDeleting}
            // Pass current state values down to ResponsesTable
            onFilterChange={handleDataTableFilterChange}
            initialSearchTerm={searchTerm}
            initialVisibleColumns={visibleColumnIds}
          />
        </>
      )}
    </div>
  );
}