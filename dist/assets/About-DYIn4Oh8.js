import { j as jsxRuntimeExports } from "./vendor-utils-PX7H9oJQ.js";
import "./vendor-react-2jRpOYbb.js";
const About = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mt-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-solo-purple mb-3", children: "Quantify your Ascent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "lead", children: "Solo is the first and only beautifully functional app dedicated to solo indoor climbing. Log your sends to rack up points, track your progress with detailed metrics, and climb your way to the top of global leaderboards. Solo is designed to help climbers like you scale new heights—one ascent at a time." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row g-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card feature-card kpi-card h-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-body text-center d-flex flex-column justify-content-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "material-icons text-solo-purple mb-2", style: { fontSize: "2.25rem" }, children: "arrow_upward" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "card-title mb-2", children: "Log Sends Instantly" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "card-text small mb-0", children: "Track all metrics for routes" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card feature-card kpi-card h-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-body text-center d-flex flex-column justify-content-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "material-icons text-solo-purple mb-2", style: { fontSize: "2.25rem" }, children: "emoji_events" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "card-title mb-2", children: "Compete Globally" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "card-text small mb-0", children: "See how you rank worldwide" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card feature-card kpi-card h-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-body text-center d-flex flex-column justify-content-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "material-icons text-solo-purple mb-2", style: { fontSize: "2.25rem" }, children: "calendar_today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "card-title mb-2", children: "View Sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "card-text small mb-0", children: "Track your sessions" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card feature-card kpi-card h-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-body text-center d-flex flex-column justify-content-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "material-icons text-solo-purple mb-2", style: { fontSize: "2.25rem" }, children: "bar_chart" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "card-title mb-2", children: "Track Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "card-text small mb-0", children: "Analyze your climbing stats" })
      ] }) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-solo-purple mb-3", children: "Frequently Asked Questions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "accordion", id: "faqAccordion", children: faqs.map((faq, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "accordion-item bg-dark border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "accordion-header", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "accordion-button bg-solo-purple text-white border-0",
            type: "button",
            "data-bs-toggle": "collapse",
            "data-bs-target": `#faq${index + 1}`,
            children: faq.question
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: `faq${index + 1}`, className: "accordion-collapse collapse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "accordion-body text-white", children: faq.answer }) })
      ] }, index)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .accordion-button::after {
          filter: brightness(0) invert(1);
        }
        ` })
  ] });
};
const faqs = [
  {
    question: "How do I log a climb?",
    answer: "To log a route, tap the '+' button in the navigation bar. Fill in the details about your route including the color, grade, and whether it was a Send or a Try. Routes are tracked as either Sends (successful completions) or Tries (unsuccessful attempts)."
  },
  {
    question: "What's the difference between a Send and a Try?",
    answer: "A 'Send' means you successfully completed the route from start to finish without falling. A 'Try' is when you attempted the route but didn't complete it. Both are valuable to track as they show your progress over time. The total number of your Sends and Tries together represents all your Routes."
  },
  {
    question: "How are points calculated?",
    answer: "Points are calculated based on the difficulty of the route and whether you sent it or not. A Send earns you 10 points multiplied by your star rating, while Tries earn 5 points multiplied by your star rating. This system rewards both successful completions and the effort put into attempting challenging routes."
  },
  {
    question: "What do the stats metrics mean?",
    answer: `Your statistics show various aspects of your climbing progress:
    • Send Rate: The percentage of successful sends out of total routes attempted
    • Average Grade: The typical difficulty level you climb
    • Points: Your overall achievement score based on your routes
    • Sessions: Groups of routes climbed within the same timeframe
    • Star Rating: Your performance rating based on successful sends`
  },
  {
    question: "What are the dimensions of a Send?",
    answer: `When logging a Send, you'll record:
    • Grade: The difficulty rating of the route
    • Color: The hold color used for the route
    • Type: Whether it's a Send (success) or Try (attempt)
    • Stars: Your rating of the route quality
    • Date: When you climbed the route
    • Session: Which climbing session it belongs to`
  }
];
export {
  About as default
};
//# sourceMappingURL=About-DYIn4Oh8.js.map
