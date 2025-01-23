import { u as useQuery, j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { r as reactExports } from "./vendor-react-2jRpOYbb.js";
import { C as Chart, a as CategoryScale, L as LinearScale, B as BarElement, b as LineElement, A as ArcElement, p as plugin_title, c as plugin_tooltip, d as plugin_legend, P as PointElement, i as index, D as Doughnut, e as Bar, f as Line } from "./vendor-charts-Bvy_ddVD.js";
import { L as LoadingSpinner, c as client } from "./index--H_wOv1N.js";
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  plugin_title,
  plugin_tooltip,
  plugin_legend,
  PointElement,
  index
);
const Stats = () => {
  const [activeTab, setActiveTab] = reactExports.useState("metrics");
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const response = await client.get("/user/me/stats");
      return response.data;
    }
  });
  const { data: chartData, isLoading: chartsLoading } = useQuery({
    queryKey: ["stats-charts"],
    queryFn: async () => {
      const response = await client.get("/api/stats");
      return response.data;
    }
  });
  if (statsLoading || chartsLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container stats-container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "ul",
      {
        className: "nav nav-pills stats-pills mb-4 sticky-top",
        role: "tablist",
        style: { top: 0, zIndex: 1020, backgroundColor: "#212529" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "nav-item", role: "presentation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `nav-link ${activeTab === "metrics" ? "active" : ""}`,
              onClick: () => setActiveTab("metrics"),
              type: "button",
              role: "tab",
              children: "Metrics"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "nav-item", role: "presentation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `nav-link ${activeTab === "trends" ? "active" : ""}`,
              onClick: () => setActiveTab("trends"),
              type: "button",
              role: "tab",
              children: "Trends"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tab-content", children: [
      activeTab === "metrics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row row-cols-1 row-cols-md-2 g-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.totalAscents,
            label: "Total Ascents"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.totalSends,
            label: "Total Sends"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.avgGrade,
            label: "Avg Grade"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.avgSentGrade,
            label: "Avg. Sent Grade"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.totalPoints,
            label: "Total Points"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.avgPointsPerClimb,
            label: "Avg Pts / Ascent"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: `${stats == null ? void 0 : stats.successRate}%`,
            label: "Send Rate"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: `${stats == null ? void 0 : stats.successRatePerSession}%`,
            label: "Session Send Rate"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.climbsPerSession,
            label: "Ascents / Session"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MetricCard,
          {
            value: stats == null ? void 0 : stats.avgAttemptsPerClimb,
            label: "Tries / Ascent"
          }
        )
      ] }),
      activeTab === "trends" && chartData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ChartCard,
          {
            title: "Route Mix",
            chart: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Doughnut,
              {
                data: {
                  labels: chartData.ascentsByDifficulty.labels,
                  datasets: [{
                    data: chartData.ascentsByDifficulty.data,
                    backgroundColor: chartData.ascentsByDifficulty.labels.map(getGradeColor)
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right"
                    }
                  }
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ChartCard,
          {
            title: "Sends",
            chart: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                data: {
                  labels: chartData.sendsByDate.labels.map(formatDate),
                  datasets: [
                    {
                      label: "Sends",
                      data: chartData.sendsByDate.sends,
                      backgroundColor: "#7442d6",
                      stack: "combined"
                    },
                    {
                      label: "Attempts",
                      data: chartData.sendsByDate.attempts,
                      backgroundColor: "#6c757d",
                      stack: "combined"
                    }
                  ]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      stacked: true
                    },
                    x: {
                      stacked: true
                    }
                  }
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ChartCard,
          {
            title: "Send Rate",
            chart: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                data: {
                  labels: chartData.metricsOverTime.labels.map(formatDate),
                  datasets: [{
                    label: "Send Rate",
                    data: chartData.metricsOverTime.metrics[0].data,
                    borderColor: "#7442d6",
                    backgroundColor: "rgba(116, 66, 214, 0.2)",
                    fill: true,
                    tension: 0.4
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ChartCard,
          {
            title: "Routes per Session",
            chart: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                data: {
                  labels: chartData.climbsPerSession.labels.map(formatDate),
                  datasets: [{
                    label: "Routes",
                    data: chartData.climbsPerSession.data,
                    borderColor: "#7442d6",
                    backgroundColor: "rgba(116, 66, 214, 0.2)",
                    fill: true,
                    tension: 0.4
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ChartCard,
          {
            title: "Send Rate by Color",
            chart: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                data: {
                  labels: chartData.sendRateByColor.labels,
                  datasets: [{
                    data: chartData.sendRateByColor.data,
                    backgroundColor: "#7442d6"
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }
              }
            )
          }
        )
      ] })
    ] })
  ] });
};
const MetricCard = ({ value, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-6 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "metric-card", style: { height: "100px" }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "metric-value", children: value ?? 0 }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "metric-label", children: label })
] }) });
const ChartCard = ({ title, chart }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card mb-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-header bg-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "card-title mb-0", children: title }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-body", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "300px", width: "100%" }, children: chart }) })
] });
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
};
const getGradeColor = (grade) => {
  const gradeColors = {
    "5.0": "#E9D8FD",
    "5.1": "#D6BCFA",
    "5.2": "#C084FC",
    "5.3": "#A855F7",
    "5.4": "#9333EA",
    "5.5": "#7E22CE",
    "5.6": "#6B21A8",
    "5.7": "#581C87",
    "5.8": "#4C1D95",
    "5.9": "#3B0764",
    "5.10a": "#350567",
    "5.10b": "#2F035E",
    "5.10c": "#290356",
    "5.10d": "#23034E",
    "5.11a": "#1D0345",
    "5.11b": "#18033C",
    "5.11c": "#130333",
    "5.11d": "#0E032B",
    "5.12a": "#090222",
    "5.12b": "#08021D",
    "5.12c": "#07021A",
    "5.12d": "#060216",
    "5.13a": "#050213",
    "5.13b": "#040210",
    "5.13c": "#03020D",
    "5.13d": "#02020A",
    "5.14a": "#010207",
    "5.14b": "#010106",
    "5.14c": "#010105",
    "5.14d": "#010104",
    "5.15a": "#010103",
    "5.15b": "#010102",
    "5.15c": "#010101",
    "5.15d": "#000000"
  };
  return gradeColors[grade] || "#7442d6";
};
export {
  Stats as default
};
//# sourceMappingURL=Stats-g7VTRNWM.js.map
