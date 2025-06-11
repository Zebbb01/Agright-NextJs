// src/components/widget/ArchivePanel.tsx
"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArchiveTable } from "@/components/data/ArchiveTable";
import { useArchive } from "@/hooks/form/useArchive";

export default function ArchivePanel() {
  const {
    paginatedForms,
    loadingForms,
    currentFormPage,
    totalFormPages,
    handlePreviousFormPage,
    handleNextFormPage,
    handleRestoreForm,
    handlePermanentDeleteForm,
    archivedFormsCount,
    paginatedResponses,
    loadingResponses,
    currentResponsePage,
    totalResponsePages,
    handlePreviousResponsePage,
    handleNextResponsePage,
    handleRestoreResponse,
    handlePermanentDeleteResponse,
    archivedResponsesCount,
  } = useArchive({ itemsPerPage: 10 }); // You can pass itemsPerPage here

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6">Archive</h2>
      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forms">Archived Forms</TabsTrigger>
          <TabsTrigger value="responses">Archived Responses</TabsTrigger>
        </TabsList>
        <TabsContent value="forms" className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Soft-Deleted Forms</h3>
          <ArchiveTable
            type="forms"
            data={paginatedForms}
            isLoading={loadingForms}
            currentPage={currentFormPage}
            totalPages={totalFormPages}
            totalItems={archivedFormsCount}
            onPreviousPage={handlePreviousFormPage}
            onNextPage={handleNextFormPage}
            onRestore={handleRestoreForm}
            onPermanentDelete={handlePermanentDeleteForm}
          />
        </TabsContent>
        <TabsContent value="responses" className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Soft-Deleted Responses</h3>
          <ArchiveTable
            type="responses"
            data={paginatedResponses}
            isLoading={loadingResponses}
            currentPage={currentResponsePage}
            totalPages={totalResponsePages}
            totalItems={archivedResponsesCount}
            onPreviousPage={handlePreviousResponsePage}
            onNextPage={handleNextResponsePage}
            onRestore={handleRestoreResponse}
            onPermanentDelete={handlePermanentDeleteResponse}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}