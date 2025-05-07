import ChartPanel from '@/components/widget/ChartPanel';
import ResponsesTable from '@/components/table/ResponsesTable';

export default function ChartPage() {
  return (
    <>
    <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartPanel />
      <ChartPanel />
    </div>
    <ResponsesTable />
    </>
    
  );
}
