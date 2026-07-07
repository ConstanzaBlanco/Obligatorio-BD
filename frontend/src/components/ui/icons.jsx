const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function MailIcon({ width = 18, height = 18, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function LockIcon({ width = 18, height = 18, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function EyeIcon({ width = 18, height = 18, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ width = 18, height = 18, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6C4.14 8.13 2 11 2 11s3.5 7 10 7a9.26 9.26 0 0 0 5.4-1.6" />
    </svg>
  );
}

export function UserIcon({ width = 18, height = 18, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function IdIcon({ width = 18, height = 18, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M14 10h4M14 14h4M6 16.5c.5-1.4 1.8-2 3-2s2.5.6 3 2" />
    </svg>
  );
}

export function CheckIcon({ width = 14, height = 14, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ArrowRightIcon({ width = 18, height = 18, ...rest }) {
  return (
    <svg width={width} height={height} {...base} {...rest}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
