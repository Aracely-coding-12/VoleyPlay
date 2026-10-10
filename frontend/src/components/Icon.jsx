const paths = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-8h6v8" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M21 21v-2a6 6 0 0 0-4-5.65" /></>,
  court: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M12 5v14M3 12h18" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h3" /></>,
  wallet: <><path d="M20 8V5a2 2 0 0 0-2-2L5 6a3 3 0 0 0-2 3v10a2 2 0 0 0 2 2h15V8H6a3 3 0 0 1-3-2" /><path d="M20 12h-5v5h5M17 14.5h.01" /></>,
  search: <><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M9 12h12m-4-4 4 4-4 4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h9V3M7 21v-8h10v8" /></>,
  reset: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  ball: <><circle cx="12" cy="12" r="9" /><path d="m12 12 1-9M12 12l7 6M12 12l-9 3M6 5l6 7M20 8l-8 4M10 21l2-9" /></>,
};

export default function Icon({ name, size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className={`ui-icon ${className}`} aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
