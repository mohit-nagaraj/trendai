import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/sections/section-cards";
import { DataTable } from "@/components/visuals/data-table";
// import { ChartPieDonut } from "@/components/visuals/chart-pie-donut";
// import { ChartBarMixed } from "@/components/visuals/chart-bar-mixed";
import { ChartAreaInteractive } from "@/components/visuals/chart-area-interactive";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import data from "@/data.json";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
              {/* <div className="flex gap-4 px-4 lg:px-6">
                <div className="basis-1/2">
                  <ChartPieDonut />
                </div>
                <div className="basis-1/2">
                  <ChartBarMixed />
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 