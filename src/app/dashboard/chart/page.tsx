import ResponsesTable from "@/components/table/ResponsesTable";
import { BarChartPanel } from "@/components/widget/BarChartPanel";
import { LineChartPanel } from "@/components/widget/LineChartPanel";

export default function ChartPage() {
  return (
    <>
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarChartPanel />
        <LineChartPanel />
      </div>
      <ResponsesTable isAdmin={true} />
    </>
  );
}
