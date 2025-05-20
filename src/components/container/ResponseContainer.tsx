// src/components/container/ResponseContainer.tsx
"use client";

import { useState } from "react";
import ResponsePanel from "../widget/ResponsePanel";
import ResponsesTable from "../table/ResponsesTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function ResponseContainer({ formId }: { formId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const { user, isLoading } = useAuth(); // Get user and isLoading from AuthContext

  // Handle case when no form is selected
  if (!formId) {
    return (
      <p className="text-center text-gray-500">
        Please select a form to view or add responses.
      </p>
    );
  }

  // Handle loading state for authentication (important!)
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading user data...</p>;
  }

  // Ensure a user is logged in before allowing response creation
  if (!user) {
    // Or redirect to login page, or show a login prompt
    return (
      <p className="text-center text-red-500">
        You must be logged in to add a response.
      </p>
    );
  }

  // Main render when formId exists and user is available
  return (
    <div className="space-y-6">
      {isCreating ? (
        // Pass the actual user.id here
        <ResponsePanel setIsOpen={setIsCreating} formId={formId} userId={user.id} />
      ) : (
        <>
          <div className="flex justify-end">
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Response
            </Button>
          </div>
          <ResponsesTable formId={formId} setIsCreating={setIsCreating} />
        </>
      )}
    </div>
  );
}