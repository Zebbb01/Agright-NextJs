import ChartPanel from '@/components/widget/ChartPanel';
import FormBuilderTable from '@/components/table/FormBuilderTable';
import MapPanel from '@/components/widget/MapPanel';
import ResponsesTable from '@/components/table/ResponsesTable';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <p className="text-lg">Welcome to the AgriTech Dashboard</p>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 justify-center items-center'>
        <div className="flex flex-col space-y-4">
          {/* Ensure both panels have the same height */}
          <div className="flex-1">
            <ChartPanel />
          </div>
          <div className="flex-1">
            <ResponsesTable />
          </div>
        </div>
        <div>
          <MapPanel />
        </div>
      </div>

    </div>
  );
}
