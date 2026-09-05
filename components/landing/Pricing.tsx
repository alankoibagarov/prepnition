export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      perks: ["Up to 5 interviews", "Basic analytics"],
    },
    {
      name: "Pro",
      price: "$49",
      perks: ["Unlimited interviews", "Team dashboards", "Priority support"],
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {plans.map((p) => (
        <div key={p.name} className="rounded-lg border bg-card p-6">
          <div className="flex items-baseline justify-between">
            <h4 className="text-lg font-semibold">{p.name}</h4>
            <div className="text-2xl font-extrabold">{p.price}</div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {p.perks.map((perk) => (
              <li key={perk}>• {perk}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
