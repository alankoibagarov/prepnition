import ApplicationDetails from "@/components/applications/ApplicationDetails";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApplicationPage({ params }: PageProps) {
  const { slug } = await params;
  return <ApplicationDetails id={slug} />;
}
