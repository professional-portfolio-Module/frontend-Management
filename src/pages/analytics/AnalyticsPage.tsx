import React, { useState, useEffect, useMemo } from "react";
import { FiTrendingUp, FiCheckCircle, FiClock, FiActivity, FiDownload, FiSearch, FiFileText } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { manualTaskService, ManualTask } from "../../services/manualTaskService";
import { assetService, Asset } from "../../services/assetService";
import { maintenanceScheduleService } from "../../services/maintenanceScheduleService";
import { Card } from "../../components/common/Card";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";

interface AnalyticsPageProps {
  role: "manager" | "staff" | "engineer";
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ role }) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30days");
  const [searchQuery, setSearchQuery] = useState("");
  const [manualTasks, setManualTasks] = useState<ManualTask[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [schedulesCount, setSchedulesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real data on component mount/hotel change
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const hotelId = user?.hotelId || "";
        
        // Fetch tasks
        const tasksData = await manualTaskService.getManualTasks({
          hotel_id: hotelId || undefined
        });
        
        // Fetch assets
        const assetsData = await assetService.getAssets({
          limit: 1000,
          hotel_id: hotelId || undefined
        });

        // Fetch schedules count
        let totalSchedules = 0;
        if (hotelId) {
          const schedulesData = await maintenanceScheduleService.getMaintenanceSchedules({
            hotel_id: hotelId,
            limit: 1000
          });
          totalSchedules = schedulesData?.pagination?.totalItems || schedulesData?.items?.length || 0;
        }

        if (active) {
          setManualTasks(tasksData || []);
          setAssets(assetsData?.items || []);
          setSchedulesCount(totalSchedules);
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [user?.hotelId]);

  // Aggregate stats based on dynamic real-time data
  const calculatedStats = useMemo(() => {
    const totalTasks = manualTasks.length;
    const completedTasks = manualTasks.filter(t => t.status === "completed");
    const emergencyTasks = manualTasks.filter(t => t.priority === "emergency");
    const activeAssets = assets.filter(a => a.status === "active");

    // 1. Task Completion Rate
    const completionRate = totalTasks > 0
      ? ((completedTasks.length / totalTasks) * 100).toFixed(1) + "%"
      : "100%";

    // 2. Average Response Time (created to completed)
    const durations = completedTasks
      .filter(t => t.created_at && t.completed_at)
      .map(t => {
        const start = new Date(t.created_at!);
        const end = new Date(t.completed_at!);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
      });
    const avgResponse = durations.length > 0
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1) + " hrs"
      : "0.0 hrs";

    // 3. Asset Health Index
    const assetHealth = assets.length > 0
      ? ((activeAssets.length / assets.length) * 100).toFixed(1) + "%"
      : "100%";

    // Render configuration per role
    if (role === "manager") {
      return [
        { label: "Overall Task Completion", value: completionRate, icon: <FiCheckCircle />, gradient: "from-emerald-500 to-teal-600", trend: `${completedTasks.length} resolved of ${totalTasks} total` },
        { label: "Average Response Time", value: avgResponse, icon: <FiClock />, gradient: "from-blue-500 to-indigo-600", trend: "Includes all manual work items" },
        { label: "Active Asset Health", value: assetHealth, icon: <FiActivity />, gradient: "from-amber-500 to-orange-600", trend: `${activeAssets.length} active of ${assets.length} assets` },
        { label: "Emergency Callouts", value: `${emergencyTasks.length} Cases`, icon: <FiTrendingUp />, gradient: "from-violet-500 to-purple-600", trend: "High priority tickets" },
      ];
    } else if (role === "engineer") {
      return [
        { label: "My Resolved Incidents", value: `${completedTasks.length} Tasks`, icon: <FiCheckCircle />, gradient: "from-emerald-500 to-teal-600", trend: "Total resolved items" },
        { label: "Mean Time to Repair (MTTR)", value: avgResponse, icon: <FiClock />, gradient: "from-blue-500 to-indigo-600", trend: "Completion lead time" },
        { label: "Critical HVAC/Chiller Health", value: assetHealth, icon: <FiActivity />, gradient: "from-red-500 to-rose-600", trend: "All monitored assets" },
        { label: "Schedules Assigned", value: `${schedulesCount} Items`, icon: <FiTrendingUp />, gradient: "from-violet-500 to-purple-600", trend: "Planned maintenance jobs" },
      ];
    } else {
      // staff
      return [
        { label: "Operational Tasks Resolved", value: `${completedTasks.length} Tasks`, icon: <FiCheckCircle />, gradient: "from-emerald-500 to-teal-600", trend: "Total solved items" },
        { label: "Average Response Time", value: avgResponse, icon: <FiClock />, gradient: "from-blue-500 to-indigo-600", trend: "Request fulfillment time" },
        { label: "Active Asset Availability", value: assetHealth, icon: <FiActivity />, gradient: "from-amber-500 to-orange-600", trend: "Percentage in active state" },
        { label: "Upcoming Schedules", value: `${schedulesCount} Items`, icon: <FiTrendingUp />, gradient: "from-violet-500 to-purple-600", trend: "Due schedules this period" },
      ];
    }
  }, [role, manualTasks, assets, schedulesCount]);

  // Chart data parsed from actual task creation dates
  const monthlyCompletionData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyCounts = Array(12).fill(0).map(() => ({ completed: 0, emergency: 0 }));

    manualTasks.forEach(task => {
      if (task.created_at) {
        const date = new Date(task.created_at);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          if (task.status === "completed") {
            monthlyCounts[monthIndex].completed += 1;
          }
          if (task.priority === "emergency") {
            monthlyCounts[monthIndex].emergency += 1;
          }
        }
      }
    });

    const currentMonth = new Date().getMonth();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      result.push({
        month: months[mIdx],
        completed: monthlyCounts[mIdx].completed,
        emergency: monthlyCounts[mIdx].emergency
      });
    }
    return result;
  }, [manualTasks]);

  // Group assets by category to compute real health distribution
  const categoryGroupsHealth = useMemo(() => {
    const groups: { [key: string]: { total: number; active: number } } = {};
    assets.forEach(a => {
      const cat = a.category_name || "General";
      if (!groups[cat]) {
        groups[cat] = { total: 0, active: 0 };
      }
      groups[cat].total += 1;
      if (a.status === "active") {
        groups[cat].active += 1;
      }
    });
    return Object.entries(groups).map(([name, val]) => ({
      name,
      percentage: val.total > 0 ? Math.round((val.active / val.total) * 100) : 0,
      total: val.total
    })).slice(0, 4); // Limit to top 4 categories
  }, [assets]);

  // Actual reports table from real-time database tasks
  const reportsList = useMemo(() => {
    return manualTasks.map(task => ({
      id: task.manual_task_id,
      title: task.title,
      category: task.asset_description || "General Equipment",
      date: task.created_at ? new Date(task.created_at).toLocaleDateString() : "N/A",
      author: task.assigned_to_name || "Unassigned",
      status: task.status
    })).filter((rep) => {
      return rep.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             rep.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
             rep.id.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [manualTasks, searchQuery]);

  const handleExportCSV = () => {
    if (reportsList.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Report ID,Title,Asset Description,Date,Assigned Technician,Status\n"
      + reportsList.map(r => `"${r.id}","${r.title}","${r.category}","${r.date}","${r.author}","${r.status}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${role}_analytics_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max value for chart scaling
  const chartMax = useMemo(() => {
    const vals = monthlyCompletionData.flatMap(d => [d.completed, d.emergency]);
    const maxVal = Math.max(...vals, 10);
    return Math.ceil(maxVal / 5) * 5;
  }, [monthlyCompletionData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading live analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Title Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reporting & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time insight tracking and system performance index for {role} role scope.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:border-primary-500 cursor-pointer font-medium"
          >
            <option value="30days">Last 30 Days</option>
          </select>
          <Button onClick={handleExportCSV} variant="primary" className="flex items-center gap-2">
            <FiDownload size={16} /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {calculatedStats.map((stat, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rounded-bl-full`} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-semibold tracking-tight leading-tight">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-sm`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              <span className="text-xs text-slate-400 font-medium">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Graphic Analytics Visualizer */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* SVG Performance Chart */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-900">Task Completion Performance Index</h2>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-600" /> Completed Tasks
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Emergency Tasks
              </span>
            </div>
          </div>

          <div className="relative h-64 w-full">
            {/* Visual SVG responsive line chart */}
            <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
              {/* Grids */}
              <line x1="40" y1="40" x2="580" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="580" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="160" x2="580" y2="160" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="210" x2="580" y2="210" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Line 1 (Completed Tasks - Primary) */}
              <path
                d={`M 40,${210 - (monthlyCompletionData[0].completed / chartMax * 170)} 
                   L 148,${210 - (monthlyCompletionData[1].completed / chartMax * 170)} 
                   L 256,${210 - (monthlyCompletionData[2].completed / chartMax * 170)} 
                   L 364,${210 - (monthlyCompletionData[3].completed / chartMax * 170)} 
                   L 472,${210 - (monthlyCompletionData[4].completed / chartMax * 170)} 
                   L 580,${210 - (monthlyCompletionData[5].completed / chartMax * 170)}`}
                fill="none"
                stroke="#1B428A"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Line 2 (Emergency Tasks - Secondary) */}
              <path
                d={`M 40,${210 - (monthlyCompletionData[0].emergency / chartMax * 170)} 
                   L 148,${210 - (monthlyCompletionData[1].emergency / chartMax * 170)} 
                   L 256,${210 - (monthlyCompletionData[2].emergency / chartMax * 170)} 
                   L 364,${210 - (monthlyCompletionData[3].emergency / chartMax * 170)} 
                   L 472,${210 - (monthlyCompletionData[4].emergency / chartMax * 170)} 
                   L 580,${210 - (monthlyCompletionData[5].emergency / chartMax * 170)}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {monthlyCompletionData.map((point, index) => {
                const x = 40 + index * 108;
                const yPrimary = 210 - (point.completed / chartMax * 170);
                const ySecondary = 210 - (point.emergency / chartMax * 170);
                return (
                  <g key={index}>
                    <circle cx={x} cy={yPrimary} r="5" fill="#1B428A" stroke="white" strokeWidth="1.5" />
                    <circle cx={x} cy={ySecondary} r="4" fill="#ef4444" stroke="white" strokeWidth="1.5" />
                    <text x={x} y="232" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
                      {point.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        {/* Category Health Distribution (Donut Progress Breakdown) */}
        <Card>
          <h2 className="text-base font-bold text-slate-900 mb-6">Asset Category Health Distribution</h2>
          <div className="space-y-5">
            {categoryGroupsHealth.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">No asset category data available</div>
            ) : (
              categoryGroupsHealth.map((group, index) => {
                const colors = ["bg-primary-500", "bg-emerald-500", "bg-indigo-500", "bg-purple-500"];
                const color = colors[index % colors.length];
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1.5 text-xs font-semibold">
                      <span className="text-slate-600">{group.name}</span>
                      <span className="text-slate-900">{group.percentage}% Active ({group.total} Assets)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`${color} h-2 rounded-full`} style={{ width: `${group.percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Reports Generated Section */}
      <Card padding="none">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FiFileText className="text-primary-500" /> Active Maintenance Operations Log
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search logs/tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs bg-white placeholder-slate-400 focus:outline-none focus:border-primary-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <Table
          columns={[
            {
              key: "id",
              label: "Task ID",
              render: (val: string) => <span className="font-semibold text-slate-950">{val}</span>,
            },
            {
              key: "title",
              label: "Task Title",
            },
            {
              key: "category",
              label: "Asset Description",
              render: (val: string) => (
                <span className="text-slate-700 text-xs font-medium">{val}</span>
              ),
            },
            {
              key: "date",
              label: "Created Date",
            },
            {
              key: "author",
              label: "Assigned Technician",
            },
            {
              key: "status",
              label: "Status",
              render: (value: string) => (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                    ${
                      value === "completed"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        : value === "rejected" || value === "expired"
                        ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20"
                        : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                    }
                  `}
                >
                  {value}
                </span>
              ),
            },
          ]}
          data={reportsList}
        />
      </Card>
    </div>
  );
};
