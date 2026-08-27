export default function Features() {
  const items = [
    {
      title: "Real interviews",
      desc: "Run realistic, recorded interviews with detailed scoring.",
    },
    {
      title: "Actionable feedback",
      desc: "Structured feedback templates that speed up reviews.",
    },
    {
      title: "Team analytics",
      desc: "Insights to help you hire consistently across teams.",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c1.5 0 3 .5 4 1.5M12 16c-1.5 0-3-.5-4-1.5"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold">{it.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}
