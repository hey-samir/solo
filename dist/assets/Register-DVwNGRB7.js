import { u as useQuery, j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { f as useNavigate, r as reactExports, L as Link } from "./vendor-react-2jRpOYbb.js";
import { c as client } from "./index--H_wOv1N.js";
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    username: "",
    password: "",
    gymId: ""
  });
  const [error, setError] = reactExports.useState(null);
  const { data: gyms } = useQuery({
    queryKey: ["gyms"],
    queryFn: async () => {
      const response = await client.get("/api/gyms");
      return response.data;
    }
  });
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    try {
      await client.post("/auth/register", form);
      navigate("/sends");
    } catch (err) {
      if ((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-8 col-lg-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-body p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          name: "name",
          className: "form-control form-control-lg",
          placeholder: "Samir",
          required: true,
          value: form.name,
          onChange: handleChange
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "email",
          name: "email",
          className: "form-control form-control-lg",
          placeholder: "name@email.com",
          required: true,
          value: form.email,
          onChange: handleChange
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Username" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-group input-group-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "input-group-text", children: "@" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            name: "username",
            className: "form-control",
            required: true,
            pattern: "[A-Za-z0-9]{1,9}",
            title: "Username must be 1-9 characters, letters and numbers only",
            placeholder: "heysamir",
            value: form.username,
            onChange: handleChange
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "password",
          name: "password",
          className: "form-control form-control-lg",
          required: true,
          placeholder: "8-12 characters, letters, numbers, symbols allowed",
          value: form.password,
          onChange: handleChange
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label required-field", children: "Home Gym" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          name: "gymId",
          className: "form-select form-select-lg mb-2",
          value: form.gymId,
          onChange: handleChange,
          required: true,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a gym" }),
            gyms == null ? void 0 : gyms.map((gym) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: gym.id, children: gym.name }, gym.id))
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "alert alert-danger", role: "alert", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "submit",
        className: "btn nav-link active bg-solo-purple w-100 py-3",
        children: "Join"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-decoration-none text-white", children: "Already have an account? Login" }) })
  ] }) }) }) }) });
};
export {
  Register as default
};
//# sourceMappingURL=Register-DVwNGRB7.js.map
