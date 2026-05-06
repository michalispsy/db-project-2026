/* Icons — minimal stroke set */
const Icon = ({ name, size = 16, ...props }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    hospital: <><path d="M4 21V8l8-4 8 4v13"/><path d="M9 21v-6h6v6"/><path d="M12 8v5"/><path d="M9.5 10.5h5"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 21c0-3.5 2.5-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M14 21c0-2.8 1.5-5 4-5s4 2 4 5"/></>,
    siren: <><path d="M7 18h10v-7a5 5 0 1 0-10 0v7Z"/><path d="M5 21h14"/><path d="M12 4V2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-8 8-8s8 3.5 8 8"/></>,
    bed: <><path d="M3 18V6"/><path d="M21 18v-6a3 3 0 0 0-3-3H8"/><path d="M3 14h18"/><path d="M3 18h18"/><circle cx="7" cy="11" r="2"/></>,
    pill: <><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)"/><path d="M8.5 8.5l7 7"/></>,
    scalpel: <><path d="M14 4l6 6-9 9-3-3 6-6V4Z"/><path d="M11 13l-7 7"/></>,
    sql: <><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></>,
    star: <><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5l6.5-.5L12 3Z"/></>,
    search: <><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/></>,
    bell: <><path d="M6 9a6 6 0 1 1 12 0v5l1.5 3h-15L6 14V9Z"/><path d="M9 19a3 3 0 0 0 6 0"/></>,
    heart: <><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    chevronRight: <><path d="M9 5l7 7-7 7"/></>,
    chevronDown: <><path d="M5 9l7 7 7-7"/></>,
    alert: <><path d="M12 4l10 17H2L12 4Z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></>,
    check: <><path d="M4 12l5 5L20 6"/></>,
    x: <><path d="M5 5l14 14"/><path d="M19 5L5 19"/></>,
    play: <><path d="M6 4l14 8-14 8V4Z" fill="currentColor"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
    sparkle: <><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"/></>,
    download: <><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></>,
    code: <><path d="M9 7l-5 5 5 5"/><path d="M15 7l5 5-5 5"/></>,
    flask: <><path d="M9 3h6"/><path d="M10 3v6L4 19c-1 2 .5 3 2 3h12c1.5 0 3-1 2-3l-6-10V3"/><path d="M7 14h10"/></>,
    shield: <><path d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3Z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name] || paths.grid}
    </svg>
  );
};

window.Icon = Icon;
