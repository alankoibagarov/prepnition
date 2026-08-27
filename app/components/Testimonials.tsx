import Image from "next/image";

export default function Testimonials() {
  const quotes = [
    {
      name: "Ava P.",
      role: "Engineering Manager",
      quote:
        "Prepnition reduced our hiring time by half and improved candidate experience.",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Liam R.",
      role: "CTO",
      quote: "The feedback flow is exceptional — actionable and consistent.",
      avatar:
        "https://images.unsplash.com/photo-1545996124-1b3b3f1a6b2f?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Maya S.",
      role: "Talent Lead",
      quote: "Our interview calibration became much easier.",
      avatar:
        "https://images.unsplash.com/photo-1545996124-1b3b3f1a6b2f?auto=format&fit=crop&w=200&q=80",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {quotes.map((q) => (
        <blockquote
          key={q.name}
          className="rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Image
              src={q.avatar}
              alt={q.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <div className="text-sm">
              <div className="font-semibold">{q.name}</div>
              <div className="text-xs text-muted-foreground">{q.role}</div>
            </div>
          </div>

          <p className="mt-4 text-sm">“{q.quote}”</p>
        </blockquote>
      ))}
    </div>
  );
}
