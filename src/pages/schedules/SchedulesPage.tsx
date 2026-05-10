import React, { useState } from "react";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiFilter, FiChevronLeft, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { mockSchedules } from "../../mock/data";
import { mockUsers } from "../../mock/users";

export const SchedulesPage: React.FC = () => {
  useAuth();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Get schedules for the selected role
  const filteredSchedules =
    filterRole === "all"
      ? mockSchedules
      : mockSchedules.filter((s) => {
          const personRole = mockUsers.find((u) => u.id === s.userId)?.role;
          return personRole === filterRole;
        });

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Get schedule for specific date
  const getSchedulesForDate = (date: Date) => {
    return filteredSchedules.filter((s) => s.date === date.toISOString().split("T")[0]);
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Month view days
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const monthDays = [];
  const firstDayOfWeek = monthStart.getDay();

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    monthDays.push(null);
  }

  // Add days of month
  for (let i = 1; i <= monthEnd.getDate(); i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    monthDays.push(date);
  }

  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "shift":
        return "👤";
      case "maintenance":
        return "🔧";
      case "training":
        return "📚";
      case "meeting":
        return "📋";
      default:
        return "📅";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Schedules</h1>
          <p className="text-gray-600">Manage and view team schedules</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <FiFilter className="text-gray-600" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="engineer">Engineers</option>
                <option value="staff">Staff Members</option>
                <option value="manager">Managers</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  viewMode === "week"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  viewMode === "month"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Month
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPeriod}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FiChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-gray-700 min-w-fit">
                {viewMode === "week"
                  ? `${weekStart.toLocaleDateString()} - ${new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                  : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={goToNextPeriod}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === "week" ? (
          // Week View
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const daySchedules = getSchedulesForDate(day);
              const isToday =
                day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${
                    isToday
                      ? "border-2 border-blue-500 bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`p-4 ${
                      isToday
                        ? "bg-blue-500 text-white"
                        : "bg-gradient-to-r from-gray-100 to-gray-50"
                    }`}
                  >
                    <p className="font-semibold">
                      {day.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <p className={`text-2xl font-bold ${isToday ? "" : "text-gray-900"}`}>
                      {day.getDate()}
                    </p>
                  </div>

                  {/* Schedules */}
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {daySchedules.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No schedules
                      </p>
                    ) : (
                      daySchedules.map((schedule) => {
                        const person = mockUsers.find(
                          (u) => u.id === schedule.userId
                        );
                        return (
                          <div
                            key={schedule.id}
                            className={`p-3 rounded-lg text-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer ${getStatusColor(
                              schedule.status
                            )}`}
                          >
                            <div className="flex items-start gap-2 mb-1">
                              <span className="text-lg">
                                {getTypeIcon(schedule.type)}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold">{person?.name}</p>
                                <p className="text-xs opacity-75 capitalize">
                                  {schedule.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-2">
                              <FiClock size={12} />
                              <span>
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            {schedule.location && (
                              <div className="flex items-center gap-1 text-xs mt-1">
                                <FiMapPin size={12} />
                                <span>{schedule.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs mt-1 opacity-75">
                              <span className="capitalize">{schedule.status}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Month View
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border-collapse">
              {/* Day Headers */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day) => (
                  <div
                    key={day}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 text-center font-semibold"
                  >
                    {day}
                  </div>
                )
              )}

              {/* Calendar Days */}
              {monthDays.map((day, index) => {
                if (!day)
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-gray-50 p-4 min-h-24 border border-gray-200"
                    />
                  );

                const daySchedules = getSchedulesForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-4 min-h-24 border border-gray-200 ${
                      isToday
                        ? "bg-blue-50 border-2 border-blue-500"
                        : day.getMonth() !== currentDate.getMonth()
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p
                      className={`font-semibold mb-2 ${
                        isToday
                          ? "text-blue-600"
                          : day.getMonth() !== currentDate.getMonth()
                          ? "text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {day.getDate()}
                    </p>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map((schedule) => {
                        const person = mockUsers.find(
                          (u) => u.id === schedule.userId
                        );
                        return (
                          <div
                            key={schedule.id}
                            className={`text-xs px-2 py-1 rounded cursor-pointer hover:shadow-md transition-shadow duration-200 truncate ${getStatusColor(
                              schedule.status
                            )}`}
                          >
                            <span className="mr-1">
                              {getTypeIcon(schedule.type)}
                            </span>
                            {person?.name}
                          </div>
                        );
                      })}
                      {daySchedules.length > 2 && (
                        <p className="text-xs text-gray-500 px-2">
                          +{daySchedules.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCalendar size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Schedules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredSchedules.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiUsers size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Scheduled Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter(
                      (s) =>
                        s.date ===
                        new Date().toISOString().split("T")[0]
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter((s) => s.status === "in-progress")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter((s) => s.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulesPage;
