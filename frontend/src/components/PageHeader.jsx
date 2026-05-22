export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
