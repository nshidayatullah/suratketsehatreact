import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import tableData from "@/app/dashboard/data.json";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      {/* Cards Section */}
      <div className="px-4">
        <SectionCards />
      </div>

      {/* Chart Section */}
      <div className="px-4">
        <ChartAreaInteractive />
      </div>

      {/* Data Table Section */}
      <div className="px-4">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}
