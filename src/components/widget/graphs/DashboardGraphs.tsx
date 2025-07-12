// src/components/widget/graphs/DashboardGraphs.tsx
import { LineChartPanel } from "@/components/widget/graphs/LineChartPanel";
import { RadialChartPanel } from "@/components/widget/graphs/RadialChartPanel";
import { ArialChartPanel } from "@/components/widget/graphs/ArialChartPanel";
// BarChartPanel is commented out in the original, so it's not imported here unless needed.
// import { BarChartPanel } from "@/components/widget/graphs/BarChartPanel";

/**
 * DashboardGraphs Component
 *
 * This component encapsulates the layout and rendering of various chart panels
 * used in the dashboard. It provides a structured way to display
 * Line Charts, Radial Charts, and an Arial Chart, organizing them
 * into a responsive grid layout.
 *
 * @returns {JSX.Element} The JSX element for the dashboard graphs.
 */
const DashboardGraphs = () => {
  return (
    // Main container for the graphs, structured into rows and columns
    <div className="grid grid-rows-1 space-y-3">
      {/* First Row: Contains two main columns for different chart types */}
      <div className="grid grid-cols-[4fr_2fr] gap-3">
        {/* Left Column: Memory/CPU & Login/Server Request Charts */}
        <div className="grid grid-rows-1 gap-3">
          {/* Top sub-row for two Line Charts (Memory/CPU & Login) */}
          <div className="grid grid-cols-2 gap-3">
            <LineChartPanel /> {/* Example: Memory Usage Chart */}
            <LineChartPanel /> {/* Example: CPU Usage Chart */}
          </div>

          {/* Server Request Row (commented out in original, kept for reference) */}
          {/* <div className="grid grid-cols-1 gap-3">
            <BarChartPanel />
          </div> */}
        </div>
        {/* End of Left Column */}

        {/* Right Column: Memory & Google hits Container with Radial Charts */}
        <div className="grid grid-rows-1 gap-3">
          {/* Top sub-row for Radial Charts (Memory & Google hits) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left sub-column for two Radial Charts */}
            <div className="grid grid-rows-2 gap-3">
              <RadialChartPanel /> {/* Example: Memory Allocation */}
              <RadialChartPanel /> {/* Example: Google Hits */}
            </div>
            {/* Right sub-column for two Radial Charts (Support calls & Sign ups) */}
            <div className="grid grid-rows-2 gap-3">
              <RadialChartPanel /> {/* Example: Support Calls */}
              <RadialChartPanel /> {/* Example: New Sign-ups */}
            </div>
          </div>

          {/* Google Hits Request Row (commented out in original, kept for reference) */}
          {/* <div className="grid grid-cols-1 gap-3">
            <LineChartPanel />
          </div> */}
        </div>
        {/* End of Right Column */}
      </div>

      {/* Second Row: Contains a single Arial Chart spanning the full width */}
      <ArialChartPanel />
    </div>
  );
};

export default DashboardGraphs;
