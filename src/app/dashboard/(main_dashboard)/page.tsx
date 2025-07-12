// src/app/dashboard/(main_dashboard)/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MapPanel from "@/components/widget/MapPanel";
import { Spinner } from "@/components/ui/spinner";
import FormSummaryTable from "@/components/data/FormSummaryTable";
import {
  fetchFormResponsesService,
  fetchFormsService,
} from "@/services";
import { FormSummary } from "@/types/form";
import DashboardGraphs from "@/components/widget/graphs/DashboardGraphs";


export default function DashboardHome() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [summaryData, setSummaryData] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"charts" | "table" | "block-summary">("charts");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const handleViewFormBlocks = (formId: string) => {
    setSelectedFormId(formId);
    setActiveTab("block-summary");
  };

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
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to the AgriTech Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <DashboardGraphs />
        </div>
      </div>

      <div className="mt-8">
        <FormSummaryTable
          summaryData={summaryData}
          loading={loading}
          error={error}
          onViewFormBlocks={handleViewFormBlocks}
        />
      </div>
    </div>
  );
}