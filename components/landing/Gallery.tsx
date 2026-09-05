import Image from "next/image";

export default function Gallery() {
  const images = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      {images.map((src, i) => (
        <div
          key={src}
          className="overflow-hidden rounded-lg bg-white/60 shadow-md"
        >
          <Image
            src={src}
            alt={`Gallery ${i + 1}`}
            width={800}
            height={600}
            className="h-48 w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
