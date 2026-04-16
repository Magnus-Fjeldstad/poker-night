export default function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`panel fade-in ${className}`}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brass-300/75">{title}</p>
          {subtitle ? <h2 className="mt-2 text-xl text-ivory-50 sm:text-2xl">{subtitle}</h2> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
