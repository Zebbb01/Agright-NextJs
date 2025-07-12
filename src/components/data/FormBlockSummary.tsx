// src\components\data\FormBlockSummary.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FormBlockSummaryProps, FormBlockData, FormSummary, BlockResponseDetail } from "@/types/form";
import { fetchFormDetailsAndResponsesForBlocksService, fetchFormsService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component
import { format } from "date-fns"; // For date formatting

export default function FormBlockSummary({
  selectedFormId: initialSelectedFormId,
  onBackToSummary,
}: FormBlockSummaryProps) {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(initialSelectedFormId);
  const [formBlockData, setFormBlockData] = useState<FormBlockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableForms, setAvailableForms] = useState<FormSummary[]>([]);
  const [isBlockDetailsModalOpen, setIsBlockDetailsModalOpen] = useState(false);
  const [currentBlockDetails, setCurrentBlockDetails] = useState<{ blockNum: number; responses: BlockResponseDetail[] } | null>(null);

  const fetchBlockData = useCallback(async (formId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFormDetailsAndResponsesForBlocksService(Number(formId));
      setFormBlockData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch block data.");
      setFormBlockData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableForms = useCallback(async () => {
    try {
      const forms = await fetchFormsService();
      setAvailableForms(forms.map(form => ({
        formId: form.id,
        formName: form.name,
        formDetails: form.details || "",
        responseCount: 0,
      })));
      if (initialSelectedFormId === null && forms.length > 0) {
        setSelectedFormId(forms[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch available forms:", err);
      setError("Failed to load available forms for selection.");
    }
  }, [initialSelectedFormId]);

  useEffect(() => {
    fetchAvailableForms();
  }, [fetchAvailableForms]);

  useEffect(() => {
    if (selectedFormId !== null) {
      fetchBlockData(selectedFormId);
    } else {
      setLoading(false);
    }
  }, [selectedFormId, fetchBlockData]);

  // Find the FormOption with label "Block" and type "Checkbox"
  const blockFormOption = formBlockData?.options.find(
    (option) => option.label === "Block" && option.type === "Checkbox"
  );

  // Determine all possible block numbers based on the FormOption with label "Block"
  const allBlockNumbers =
    blockFormOption && blockFormOption.options
      ? blockFormOption.options.map(Number).sort((a, b) => a - b)
      : [];

  // Get the detailed response data for blocks
  const blockResponseDetails = formBlockData?.blockResponseDetails || {};

  // Calculate overall duplication
  const duplicatedBlocksCount = Object.values(blockResponseDetails).filter(
    (responses) => responses.length > 1
  ).length;

  const handleBlockClick = (blockNum: number) => {
    const responsesForBlock = blockResponseDetails[blockNum] || [];
    setCurrentBlockDetails({ blockNum, responses: responsesForBlock });
    setIsBlockDetailsModalOpen(true);
  };

  if (loading && selectedFormId !== null) {
    return <div className="text-center py-8">Loading block data...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
        <Button onClick={onBackToSummary} className="mt-4">
          Back to Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Form Block Summary</h2>
        <Button onClick={onBackToSummary} variant="outline">
          Back to Summary Table
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="form-select" className="text-sm font-medium">
          Select Form:
        </label>
        <Select
          onValueChange={(value) => setSelectedFormId(value)}
          value={selectedFormId || ""}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a form" />
          </SelectTrigger>
          <SelectContent>
            {availableForms.length > 0 ? (
              availableForms.map((form) => (
                <SelectItem key={form.formId} value={form.formId}>
                  {form.formName}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-forms" disabled>No forms available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedFormId === null ? (
        <p className="text-center py-8 text-muted-foreground">
          Please select a form from the dropdown above or from the "Summary Table" tab to view its block summary.
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{formBlockData?.formName || "Selected Form"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total Potential Blocks: {allBlockNumbers.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Blocks with Responses: {Object.keys(blockResponseDetails).filter(key => blockResponseDetails[Number(key)].length > 0).length}
            </p>
            <p className="text-sm text-muted-foreground">
              Count of Duplicated Blocks (responded by more than one response): <span className="font-semibold text-orange-600">{duplicatedBlocksCount}</span>
            </p>
          </CardHeader>
          <CardContent>
            {allBlockNumbers.length > 0 ? (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {allBlockNumbers.map((blockNum) => {
                  const responsesCount = (blockResponseDetails[blockNum]?.length || 0);
                  const isResponded = responsesCount > 0;
                  const isDuplicated = responsesCount > 1;

                  return (
                    <div
                      key={blockNum}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-lg text-lg font-bold cursor-pointer transition-all duration-200
                      ${isResponded ? "bg-primary text-primary-foreground shadow-md" : "border border-gray-300 text-gray-700 hover:bg-gray-100"}
                      ${isDuplicated ? "ring-2 ring-orange-500 ring-offset-1" : ""}`}
                      title={isResponded ? `Block ${blockNum} responded by ${responsesCount} response(s)` : `Block ${blockNum} has no responses`}
                      onClick={() => handleBlockClick(blockNum)}
                    >
                      {blockNum}
                      {isResponded && (
                        <Badge
                          variant={isDuplicated ? "destructive" : "secondary"}
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full text-xs"
                        >
                          {responsesCount}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                This form does not have a "Block" (Checkbox) field defined with options (e.g., "1", "2", "3"), or no responses have been recorded for it yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Block Details Modal */}
      <Dialog open={isBlockDetailsModalOpen} onOpenChange={setIsBlockDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Details for Block {currentBlockDetails?.blockNum}</DialogTitle>
            <DialogDescription>
              Responses that selected this block.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {currentBlockDetails?.responses && currentBlockDetails.responses.length > 0 ? (
              <ul className="space-y-3">
                {currentBlockDetails.responses.map((detail, index) => (
                  <li key={index} className="p-3 border rounded-md bg-gray-50">
                    <p className="font-semibold text-gray-800">Responded by: {detail.userName}</p>
                    <p className="text-sm text-gray-600">Response ID: {detail.responseId}</p>
                    <p className="text-sm text-gray-600">
                      Responded at: {format(new Date(detail.createdAt), "PPP - p")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No responses found for this block.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
