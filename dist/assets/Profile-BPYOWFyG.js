import { u as useQuery, j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { L as LoadingSpinner, c as client } from "./index--H_wOv1N.js";
import { e as useParams } from "./vendor-react-2jRpOYbb.js";
const Profile = () => {
  const { username } = useParams();
  const isOwnProfile = !username;
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const response = await client.get(`/user/${username || "me"}`);
      return response.data;
    },
    enabled: !!username || isOwnProfile
  });
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats", username],
    queryFn: async () => {
      const response = await client.get(`/user/${username || "me"}/stats`);
      return response.data;
    },
    enabled: !!user
  });
  if (userLoading || statsLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-red-600", children: "User not found" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: user.profilePhoto || "/default-avatar.svg",
          alt: `${user.username}'s profile`,
          className: "w-32 h-32 rounded-full mx-auto mb-4"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: user.username }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600", children: [
        "Member since ",
        new Date(user.memberSince).toLocaleDateString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-value", children: (stats == null ? void 0 : stats.totalAscents) || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-label", children: "Total Ascents" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-value", children: (stats == null ? void 0 : stats.avgGrade) || "--" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-label", children: "Average Grade" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-value", children: (stats == null ? void 0 : stats.totalPoints) || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-label", children: "Total Points" })
      ] })
    ] })
  ] });
};
export {
  Profile as default
};
//# sourceMappingURL=Profile-BPYOWFyG.js.map
