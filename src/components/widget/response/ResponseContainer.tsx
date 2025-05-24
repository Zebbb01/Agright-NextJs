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
      {isCreating ? (
        <div className="flex justify-center mx-auto mb-4">
          <ResponsePanel
            setIsOpen={setIsCreating}
            formId={formId}
            userId={user.id}
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
          />
        </>
      )}
    </div>
  );
}
