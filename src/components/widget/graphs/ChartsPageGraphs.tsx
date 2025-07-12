// src/components/widget/graphs/ChartsPageGraphs.tsx
import { BarChartPanel } from "@/components/widget/graphs/BarChartPanel";
import { LineChartPanel } from "@/components/widget/graphs/LineChartPanel";
import { RadialChartPanel } from "@/components/widget/graphs/RadialChartPanel";
import { ArialChartPanel } from "@/components/widget/graphs/ArialChartPanel";

/**
 * ChartsPageGraphs Component
 *
 * This component aggregates and renders the various chart panels
 * specifically designed for the "Charts" tab on the dashboard's charts page.
 * It provides a structured grid layout for line charts, bar charts, radial charts,
 * and an Arial chart, enhancing modularity and readability of the main page component.
 *
 * @returns {JSX.Element} The JSX element for the charts page graphs.
 */
const ChartsPageGraphs = () => {
  return (
    <div className="space-y-4 grid grid-cols-1 gap-4">
      {/* Main Container for all charts */}
      <div className="grid grid-rows-1 space-y-3">
        {/* First Row: Split into two main columns */}
        <div className="grid grid-cols-[4fr_2fr] gap-3">
          {/* Left Column: Memory/CPU, Login & Server Request Charts */}
          <div className="grid grid-rows-2 gap-3">
            {/* Memory/CPU & Login Row (two Line Charts) */}
            <div className="grid grid-cols-2 gap-3">
              <LineChartPanel />
              <LineChartPanel />
            </div>
            {/* Server Request Row (one Bar Chart) */}
            <div className="grid grid-cols-1 gap-3">
              <BarChartPanel />
            </div>
          </div>
          {/* End of Memory/Cpu, Login & Server Request Container */}

          {/* Right Column: Memory & Google hits Container with Radial and Line Charts */}
          <div className="grid grid-rows-2 gap-3">
            {/* Memory & Google hits Row (four Radial Charts in two sub-columns) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Memory & Google hits Radial Charts */}
              <div className="grid grid-rows-2 gap-3">
                <RadialChartPanel />
                <RadialChartPanel />
              </div>
              {/* Support calls & Sign ups Radial Charts */}
              <div className="grid grid-rows-2 gap-3">
                <RadialChartPanel />
                <RadialChartPanel />
              </div>
            </div>
            {/* Google Hits Request Row (one Line Chart) */}
            <div className="grid grid-cols-1 gap-3">
              <LineChartPanel />
            </div>
          </div>
          {/* End of Memory & Google hits Container */}
        </div>
        {/* Arial Chart Panel spanning the width */}
        <ArialChartPanel />
      </div>
    </div>
  );
};

export default ChartsPageGraphs;
