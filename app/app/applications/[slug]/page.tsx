interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApplicationPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Application: {slug}</h1>
      <p>Details for application with slug: {slug}</p>
    </section>
  );
}
