import { u as useQuery, b as useMutation, j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { r as reactExports } from "./vendor-react-2jRpOYbb.js";
import { L as LoadingSpinner, c as client } from "./index--H_wOv1N.js";
const colorToHex = {
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
const Sends = () => {
  const [formData, setFormData] = reactExports.useState({
    route_id: 0,
    tries: 1,
    status: true,
    rating: 3,
    notes: ""
  });
  const { data: routes, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const response = await client.get("/routes");
      return response.data;
    }
  });
  const sendMutation = useMutation({
    mutationFn: async (data) => {
      return await client.post("/climbs", data);
    },
    onSuccess: () => {
      setFormData({
        route_id: 0,
        tries: 1,
        status: true,
        rating: 3,
        notes: ""
      });
    }
  });
  const calculatePoints = (grade, rating, status, tries) => {
    if (!grade) return 0;
    const [_, mainGrade, subGrade] = grade.match(/5\.(\d+)([a-d])?/) || [null, "0", ""];
    const basePoints = {
      "5": 50,
      "6": 60,
      "7": 70,
      "8": 80,
      "9": 100,
      "10": 150,
      "11": 200,
      "12": 300,
      "13": 400,
      "14": 500,
      "15": 600
    };
    const subGradeMultiplier = {
      "a": 1,
      "b": 1.1,
      "c": 1.2,
      "d": 1.3
    };
    const base = (basePoints[mainGrade] || 0) * (subGradeMultiplier[subGrade] || 1);
    const starMultiplier = Math.max(0.1, rating / 3);
    const statusMultiplier = status ? 1 : 0.5;
    const triesMultiplier = Math.max(0.1, 1 / Math.sqrt(tries));
    return Math.round(base * starMultiplier * statusMultiplier * triesMultiplier);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  const selectedRoute = routes == null ? void 0 : routes.find((r) => r.id === formData.route_id);
  const points = selectedRoute ? calculatePoints(selectedRoute.grade, formData.rating, formData.status, formData.tries) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-body p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
    e.preventDefault();
    sendMutation.mutate(formData);
  }, className: "w-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "table table-form w-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-label-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Route" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-input-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "form-select form-select-lg custom-select",
            value: formData.route_id || "",
            onChange: (e) => setFormData((prev) => ({ ...prev, route_id: Number(e.target.value) })),
            required: true,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Select a route" }),
              routes == null ? void 0 : routes.map((route) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "option",
                {
                  value: route.id,
                  className: "route-option",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "color-dot",
                        style: { backgroundColor: colorToHex[route.color] || "#FFFFFF" }
                      }
                    ),
                    route.wall_sector,
                    " - ",
                    route.anchor_number,
                    " - ",
                    route.color,
                    " ",
                    route.grade
                  ]
                },
                route.id
              ))
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-label-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Tries" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-input-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex align-items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "range",
              min: "1",
              max: "10",
              value: formData.tries,
              onChange: (e) => setFormData((prev) => ({ ...prev, tries: Number(e.target.value) })),
              className: "form-range"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: formData.tries })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-label-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-input-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-check form-switch", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              className: "form-check-input custom-switch",
              type: "checkbox",
              role: "switch",
              checked: formData.status,
              onChange: (e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-check-label", children: formData.status ? "Sent" : "Attempted" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-label-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Stars" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-input-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rating-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rating", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "i",
          {
            className: `rating-star bi bi-star-fill ${star <= formData.rating ? "active" : ""}`,
            onClick: () => setFormData((prev) => ({ ...prev, rating: star }))
          },
          star
        )) }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-label-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label", children: "Notes" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "form-input-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            className: "form-control form-control-lg",
            rows: 3,
            value: formData.notes,
            onChange: (e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-3 w-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          className: "btn btn-primary btn-lg w-100",
          disabled: sendMutation.isPending,
          children: sendMutation.isPending ? "Sending..." : formData.status ? "Send" : "Log"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white mt-3 text-center fs-6", children: [
        "Points: ",
        points
      ] })
    ] })
  ] }) }) }) });
};
export {
  Sends as default
};
//# sourceMappingURL=Sends-DAQv27ow.js.map
