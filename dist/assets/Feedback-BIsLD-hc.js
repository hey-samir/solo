import { u as useQuery, b as useMutation, j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { r as reactExports } from "./vendor-react-2jRpOYbb.js";
import { c as client } from "./index--H_wOv1N.js";
const categories = [
  "Bug Report",
  "Feature Request",
  "User Experience",
  "Performance Issue",
  "Other"
];
const Feedback = () => {
  const [sort, setSort] = reactExports.useState("new");
  const [form, setForm] = reactExports.useState({
    title: "",
    description: "",
    category: ""
  });
  const { data: feedbackItems, refetch } = useQuery({
    queryKey: ["feedback", sort],
    queryFn: async () => {
      const response = await client.get(`/api/feedback?sort=${sort}`);
      return response.data;
    }
  });
  const submitFeedback = useMutation({
    mutationFn: async (formData) => {
      return await client.post("/api/feedback", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
    },
    onSuccess: () => {
      setForm({
        title: "",
        description: "",
        category: ""
      });
      refetch();
    }
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    if (form.screenshot) {
      formData.append("screenshot", form.screenshot);
    }
    submitFeedback.mutate(formData);
  };
  const handleFileChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) {
      setForm((prev) => ({ ...prev, screenshot: file }));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row justify-content-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card bg-dark", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-body", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, encType: "multipart/form-data", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            className: "form-control",
            placeholder: "Short, descriptive title",
            required: true,
            value: form.title,
            onChange: (e) => setForm((prev) => ({ ...prev, title: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            className: "form-control",
            placeholder: "Detailed description of your feedback",
            required: true,
            value: form.description,
            onChange: (e) => setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "form-select",
            required: true,
            value: form.category,
            onChange: (e) => setForm((prev) => ({ ...prev, category: e.target.value })),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a category" }),
              categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category, children: category }, category))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label", children: "Screenshot" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            className: "form-control",
            accept: "image/*",
            onChange: handleFileChange
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          className: "btn bg-solo-purple text-white w-100",
          disabled: submitFeedback.isPending,
          children: submitFeedback.isPending ? "Submitting..." : "Submit"
        }
      )
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card bg-dark", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-header", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "card-title mb-0", children: "Community Feedback" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-body", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "btn-group mb-3 w-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `btn btn-outline-secondary ${sort === "new" ? "active" : ""}`,
              onClick: () => setSort("new"),
              children: "Latest"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `btn btn-outline-secondary ${sort === "top" ? "active" : ""}`,
              onClick: () => setSort("top"),
              children: "Top"
            }
          )
        ] }),
        feedbackItems == null ? void 0 : feedbackItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feedback-item mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h6", { children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1", children: item.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("small", { className: "text-muted", children: [
            "By @",
            item.user.username,
            " on ",
            new Date(item.created_at).toLocaleDateString()
          ] })
        ] }, item.id))
      ] })
    ] }) })
  ] });
};
export {
  Feedback as default
};
//# sourceMappingURL=Feedback-BIsLD-hc.js.map
