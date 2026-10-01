// The three-circle mark (violet / terracotta / gold — the brand's jewel-tone
// palette) reads as a small cluster of connections, which is the whole
// product. Reused at nav size here; see public/logo.svg for a standalone
// export with the full wordmark lockup.
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <circle cx="16" cy="20" r="13" fill="#8259e8" />
      <circle cx="27" cy="12" r="10" fill="#f2660f" fillOpacity="0.9" />
      <circle cx="27" cy="28" r="10" fill="#d99a0b" fillOpacity="0.9" />
    </svg>
  );
}
