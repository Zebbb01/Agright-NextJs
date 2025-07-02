// src/components/widget/ArchivePanel.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react"; // Import useState, useCallback, useEffect
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ArchiveTable } from "@/components/data/ArchiveTable";
import { useArchive } from "@/hooks/form/useArchive";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { DataTableColumn } from "@/types/data-table"; // Import DataTableColumn
import { Form, FormResponse } from "@/types/form"; // Import Form and FormResponse types

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
    allFormColumnLabels, // NEW

    paginatedResponses,
    loadingResponses,
    currentResponsePage,
    totalResponsePages,
    handlePreviousResponsePage,
    handleNextResponsePage,
    handleRestoreResponse,
    handlePermanentDeleteResponse,
    archivedResponsesCount,
    allResponseColumnLabels, // NEW

    setFormSearchTerm, // NEW
    setResponseSearchTerm, // NEW
    setFormVisibleColumnIds, // NEW
    setResponseVisibleColumnIds, // NEW
    formSearchTerm, // NEW
    responseSearchTerm, // NEW
    formVisibleColumnIds, // NEW
    responseVisibleColumnIds, // NEW
  } = useArchive({ itemsPerPage: 10 });

  // Variants for tab content animation
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Handlers for Form filters
  const handleFormFilterChange = useCallback(
    ({
      searchTerm: newSearchTerm,
      visibleColumns: newVisibleColumnIds,
    }: {
      searchTerm: string;
      visibleColumns: string[];
    }) => {
      setFormSearchTerm(newSearchTerm);
      setFormVisibleColumnIds(newVisibleColumnIds);
      // When filters change, typically reset to the first page for that tab
      // The useArchive hook already handles resetting current page for the filtered dataset
    },
    [setFormSearchTerm, setFormVisibleColumnIds]
  );

  // Handlers for Response filters
  const handleResponseFilterChange = useCallback(
    ({
      searchTerm: newSearchTerm,
      visibleColumns: newVisibleColumnIds,
    }: {
      searchTerm: string;
      visibleColumns: string[];
    }) => {
      setResponseSearchTerm(newSearchTerm);
      setResponseVisibleColumnIds(newVisibleColumnIds);
      // The useArchive hook already handles resetting current page for the filtered dataset
    },
    [setResponseSearchTerm, setResponseVisibleColumnIds]
  );

  return (
    <div className="container mx-auto py-5">
      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 mb-3">
          <TabsTrigger value="forms" className="flex items-center gap-2">
            Archived Forms
            {archivedFormsCount > 0 && (
              <Badge variant="secondary" className="px-2 py-0.5 rounded-full">
                {archivedFormsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            Archived Responses
            {archivedResponsesCount > 0 && (
              <Badge variant="secondary" className="px-2 py-0.5 rounded-full">
                {archivedResponsesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <Separator className="my-5" />

        <AnimatePresence mode="wait">
          <TabsContent value="forms" key="forms-tab">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <h3 className="text-2xl font-semibold mb-4">Deleted Forms</h3>
              {archivedFormsCount === 0 && !loadingForms && formSearchTerm === "" ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground">
                  <p>No archived forms found.</p>
                </div>
              ) : (
                <ArchiveTable<Form>
                  type="forms"
                  data={paginatedForms}
                  isLoading={loadingForms}
                  currentPage={currentFormPage}
                  totalPages={totalFormPages}
                  totalItems={archivedFormsCount} // Pass the filtered count
                  onPreviousPage={handlePreviousFormPage}
                  onNextPage={handleNextFormPage}
                  onRestore={handleRestoreForm}
                  onPermanentDelete={handlePermanentDeleteForm}
                  // NEW PROPS FOR FILTERING
                  allColumns={allFormColumnLabels}
                  searchTerm={formSearchTerm}
                  visibleColumnIds={formVisibleColumnIds}
                  onFilterChange={handleFormFilterChange}
                />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="responses" className="mt-6" key="responses-tab">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <h3 className="text-2xl font-semibold mb-4">Deleted Responses</h3>
              {archivedResponsesCount === 0 && !loadingResponses && responseSearchTerm === "" ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground">
                  <p>No archived responses found.</p>
                </div>
              ) : (
                <ArchiveTable<FormResponse>
                  type="responses"
                  data={paginatedResponses}
                  isLoading={loadingResponses}
                  currentPage={currentResponsePage}
                  totalPages={totalResponsePages}
                  totalItems={archivedResponsesCount} // Pass the filtered count
                  onPreviousPage={handlePreviousResponsePage}
                  onNextPage={handleNextResponsePage}
                  onRestore={handleRestoreResponse}
                  onPermanentDelete={handlePermanentDeleteResponse}
                  // NEW PROPS FOR FILTERING
                  allColumns={allResponseColumnLabels}
                  searchTerm={responseSearchTerm}
                  visibleColumnIds={responseVisibleColumnIds}
                  onFilterChange={handleResponseFilterChange}
                />
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}