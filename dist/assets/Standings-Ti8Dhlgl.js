import{j as e,L as i}from"./index-CRmSxCet.js";import{u as n,c}from"./client-CxmSR7-X.js";const l=()=>{const{data:t,isLoading:a}=n({queryKey:["leaderboard"],queryFn:async()=>(await c.get("/leaderboard")).data});return a?e.jsx(i,{}):e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsx("h1",{className:"section-title",children:"Global Rankings"}),e.jsx("div",{className:"bg-white rounded-lg shadow overflow-hidden",children:e.jsxs("table",{className:"min-w-full divide-y divide-gray-200",children:[e.jsx("thead",{className:"bg-gray-50",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Rank"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Climber"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Total Ascents"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Total Points"})]})}),e.jsx("tbody",{className:"bg-white divide-y divide-gray-200",children:t==null?void 0:t.map((s,r)=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-900",children:r+1}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",children:s.username}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:s.totalAscents}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:s.totalPoints})]},s.username))})]})}),(!t||t.length===0)&&e.jsx("p",{className:"text-center text-gray-600 mt-8",children:"No climbers have recorded any ascents yet."})]})};export{l as default};
//# sourceMappingURL=Standings-Ti8Dhlgl.js.map