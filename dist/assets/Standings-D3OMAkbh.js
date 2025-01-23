import { u as useQuery, j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { r as reactExports } from "./vendor-react-2jRpOYbb.js";
import { L as LoadingSpinner, c as client } from "./index--H_wOv1N.js";
const Standings = () => {
  const [cacheInfo, setCacheInfo] = reactExports.useState({
    isFromCache: false,
    timestamp: null
  });
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      var _a, _b;
      const response = await client.get("/leaderboard");
      const timestamp = ((_a = response.headers) == null ? void 0 : _a["x-cache-timestamp"]) || null;
      const isFromCache = ((_b = response.headers) == null ? void 0 : _b["x-data-source"]) === "cache";
      setCacheInfo({ isFromCache, timestamp });
      return response.data;
    }
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container-fluid px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-body p-0", children: [
    cacheInfo.isFromCache && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "alert alert-info m-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "material-icons align-middle", children: "access_time" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Viewing cached standings" }),
      cacheInfo.timestamp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ms-2 text-muted", children: [
        "Last updated: ",
        new Date(cacheInfo.timestamp).toLocaleString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table-hover mb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center", children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center", children: "Sends" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center", children: "Grade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center", children: "Pts" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: leaderboard == null ? void 0 : leaderboard.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center", children: index + 1 <= 3 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "material-symbols-outlined", children: [
          "counter_",
          index + 1
        ] }) : index + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: entry.username }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center", children: entry.totalSends }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center", children: entry.avgGrade }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center", children: entry.totalPoints })
      ] }, entry.username)) })
    ] }) })
  ] }) }) });
};
export {
  Standings as default
};
//# sourceMappingURL=Standings-D3OMAkbh.js.map
