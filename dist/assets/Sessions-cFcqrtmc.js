import { u as useQuery, j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { r as reactExports } from "./vendor-react-2jRpOYbb.js";
import { L as LoadingSpinner, c as client } from "./index--H_wOv1N.js";
const Sessions = () => {
  const [sortConfig, setSortConfig] = reactExports.useState({
    key: "color",
    direction: "asc",
    date: null
  });
  const { data: climbs, isLoading } = useQuery({
    queryKey: ["climbs"],
    queryFn: async () => {
      const response = await client.get("/climbs");
      return response.data;
    }
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  const getColorHex = (color) => {
    const colorMap = {
      "White": "#FFFFFF",
      "Pink": "#FF69B4",
      "Blue": "#0000FF",
      "Black": "#000000",
      "Orange": "#FFA500",
      "Purple": "#800080",
      "Green": "#008000",
      "Red": "#FF0000",
      "Yellow": "#FFFF00",
      "Teal": "#008080"
    };
    return colorMap[color] || "#CCCCCC";
  };
  const climbsByDate = (climbs == null ? void 0 : climbs.reduce((acc, climb) => {
    const date = new Date(climb.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(climb);
    return acc;
  }, {})) || {};
  const sortClimbs = (climbs2) => {
    return [...climbs2].sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case "color":
          comparison = a.route.color.localeCompare(b.route.color);
          break;
        case "grade":
          comparison = a.route.grade.localeCompare(b.route.grade);
          break;
        case "status":
          comparison = Number(b.status) - Number(a.status);
          break;
        case "tries":
          comparison = a.tries - b.tries;
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "points":
          comparison = a.points - b.points;
          break;
        default:
          return 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  };
  const handleSort = (key, date) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.date === date && current.direction === "asc" ? "desc" : "asc",
      date
    }));
  };
  const renderSortIcon = (key, date) => {
    if (sortConfig.key !== key || sortConfig.date !== date) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", children: sortConfig.direction === "asc" ? "↑" : "↓" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-6", children: "Your Climbing Sessions" }),
    Object.entries(climbsByDate).map(([date, sessionClimbs]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-4", children: date }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full bg-white border border-gray-200 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "th",
            {
              className: "px-4 py-2 cursor-pointer",
              onClick: () => handleSort("color", date),
              children: [
                "Color ",
                renderSortIcon("color", date)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "th",
            {
              className: "px-4 py-2 cursor-pointer",
              onClick: () => handleSort("grade", date),
              children: [
                "Grade ",
                renderSortIcon("grade", date)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "th",
            {
              className: "px-4 py-2 cursor-pointer",
              onClick: () => handleSort("status", date),
              children: [
                "Status ",
                renderSortIcon("status", date)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "th",
            {
              className: "px-4 py-2 cursor-pointer",
              onClick: () => handleSort("tries", date),
              children: [
                "# Tries ",
                renderSortIcon("tries", date)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "th",
            {
              className: "px-4 py-2 cursor-pointer",
              onClick: () => handleSort("rating", date),
              children: [
                "Stars ",
                renderSortIcon("rating", date)
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "th",
            {
              className: "px-4 py-2 cursor-pointer",
              onClick: () => handleSort("points", date),
              children: [
                "Points ",
                renderSortIcon("points", date)
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortClimbs(sessionClimbs).map((climb) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-100 hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "w-4 h-4 rounded-full mr-2",
                style: {
                  backgroundColor: getColorHex(climb.route.color),
                  border: climb.route.color === "White" ? "1px solid #ccc" : "none"
                }
              }
            ),
            climb.route.color
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: climb.route.grade }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${climb.status ? "text-green-600" : "text-red-600"}`, children: climb.status ? "Send" : "Attempt" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: climb.tries }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2", children: [
            climb.rating,
            "/5"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-purple-600 font-medium", children: [
            climb.points,
            " pts"
          ] }) })
        ] }, climb.id)) })
      ] }) })
    ] }, date)),
    Object.keys(climbsByDate).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center my-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xl text-gray-600 mb-4", children: "Enter your first climb to see Sessions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/sends",
          className: "inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition",
          children: "Back to Sends"
        }
      )
    ] })
  ] });
};
export {
  Sessions as default
};
//# sourceMappingURL=Sessions-cFcqrtmc.js.map
