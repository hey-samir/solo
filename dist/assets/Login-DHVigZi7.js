import { j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import { f as useNavigate, r as reactExports, L as Link } from "./vendor-react-2jRpOYbb.js";
import { c as client } from "./index--H_wOv1N.js";
const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState({
    username: "",
    password: ""
  });
  const [error, setError] = reactExports.useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post("/auth/login", form);
      navigate("/sends");
    } catch (err) {
      setError("Whoops! That beta isn't matching our guidebook. Double-check and try again!");
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fs-4", children: "Username" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "input-group-text", children: "@" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            name: "username",
            className: "form-control form-control-lg",
            required: true,
            pattern: "[A-Za-z0-9]{1,10}",
            title: "Username must be 1-10 characters, letters and numbers only",
            value: form.username,
            onChange: handleChange
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fs-4", children: "Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "password",
          name: "password",
          className: "form-control form-control-lg",
          required: true,
          value: form.password,
          onChange: handleChange
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "alert alert-danger", role: "alert", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          className: "btn nav-link active w-50",
          style: { backgroundColor: "#313d58" },
          children: "Login"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/signup",
          className: "btn nav-link active bg-solo-purple w-50",
          children: "Sign up"
        }
      )
    ] })
  ] }) }) }) }) });
};
export {
  Login as default
};
//# sourceMappingURL=Login-DHVigZi7.js.map
