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
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Badge } from "@/components/ui/badge"; // Import Badge for counts
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

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
    archivedFormsCount, // Use this for the badge
    paginatedResponses,
    loadingResponses,
    currentResponsePage,
    totalResponsePages,
    handlePreviousResponsePage,
    handleNextResponsePage,
    handleRestoreResponse,
    handlePermanentDeleteResponse,
    archivedResponsesCount, // Use this for the badge
  } = useArchive({ itemsPerPage: 10 });

  // Variants for tab content animation
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="container mx-auto py-5">
      

      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 mb-3"> {/* Adjusted height for better look with badges */}
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

        <AnimatePresence mode="wait"> {/* Use mode="wait" to ensure exit animation completes before new content enters */}
          <TabsContent value="forms" key="forms-tab">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <h3 className="text-2xl font-semibold mb-4">Deleted Forms</h3>
              {archivedFormsCount === 0 && !loadingForms ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground">
                  <p>No archived forms found.</p>
                </div>
              ) : (
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
              {archivedResponsesCount === 0 && !loadingResponses ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg text-muted-foreground">
                  <p>No archived responses found.</p>
                </div>
              ) : (
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
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}