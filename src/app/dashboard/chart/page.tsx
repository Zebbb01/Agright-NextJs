// src/app/dashboard/chart/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChartPanel } from "@/components/widget/graphs/BarChartPanel";
import { LineChartPanel } from "@/components/widget/graphs/LineChartPanel";
import FormSummaryTable from "@/components/data/FormSummaryTable";
import {
  fetchFormsService,
  fetchFormResponsesService,
} from "@/services";
import { FormSummary } from "@/types/form";
import { RadialChartPanel } from "@/components/widget/graphs/RadialChartPanel";
import { ArialChartPanel } from "@/components/widget/graphs/ArialChartPanel";

export default function ChartPage() {
  const [summaryData, setSummaryData] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"charts" | "table">("charts"); // State for active tab

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const forms = await fetchFormsService();
      const newSummaryData: FormSummary[] = [];

      for (const form of forms) {
        const responses = await fetchFormResponsesService(form.id);

        const sortedResponses = [...responses].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const lastResponse =
          sortedResponses.length > 0
            ? sortedResponses[sortedResponses.length - 1]
            : null;

        const lastResponseUser =
          lastResponse?.user?.name ||
          (lastResponse?.userId !== undefined
            ? String(lastResponse.userId)
            : undefined) ||
          "N/A";

        newSummaryData.push({
          formId: form.id,
          formName: form.name,
          formDetails: form.details ?? "",
          responseCount: responses.length,
          lastResponseUser: lastResponseUser,
        });
      }
      setSummaryData(newSummaryData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === "charts"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setActiveTab("charts")}
        >
          Charts
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === "table"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setActiveTab("table")}
        >
          Summary Table
        </button>
      </div>


      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "charts" && (
          <div className="grid grid-cols-1 gap-4">
            {/*--------- Container ---------*/}
            <div className="grid grid-rows-1 space-y-3">
              {/*--------- First Row ---------*/}
              <div className="grid grid-cols-[4fr_2fr] gap-3">
                {/* Memory/Cpu, Login & Server Request Container */}
                <div className="grid grid-rows-2 gap-3">
                  {/* Memory/Cpu & Login Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <LineChartPanel />
                    <LineChartPanel />
                  </div>

                  {/* Server Request Row */}
                  <div className="grid grid-cols-1 gap-3">
                    <BarChartPanel />
                  </div>
                </div>
                {/* End of Memory/Cpu, Login & Server Request Container */}

                {/* Memory & Google hits Container */}
                <div className="grid grid-rows-2 gap-3">
                  {/* Memory & Google hits Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Memory & Google hits Row */}
                    <div className="grid grid-rows-2 gap-3">
                      <RadialChartPanel />
                      <RadialChartPanel />
                    </div>
                    {/* Support calls & Sign ups Row */}
                    <div className="grid grid-rows-2 gap-3">
                      <RadialChartPanel />
                      <RadialChartPanel />
                    </div>
                  </div>

                  {/* Google Hits Request Row */}
                  <div className="grid grid-cols-1 gap-3">
                    <LineChartPanel />
                  </div>
                </div>
                {/* End of Memory & Google hits Container */}
              </div>

              <ArialChartPanel />
            </div>
          </div>
        )}

        {activeTab === "table" && (
          <FormSummaryTable
            summaryData={summaryData}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}