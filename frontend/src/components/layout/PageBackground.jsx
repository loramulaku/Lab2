/**
 * Fixed decorative background for public/header pages.
 * Rendered once inside PageShell — do not use directly in pages.
 */
export default function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 page-shell-bg" />
      <div className="absolute -top-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-blue-300/30 blur-3xl" />
      <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-indigo-200/35 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" />
    </div>
  );
}
