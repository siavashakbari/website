import { createFileRoute } from "@tanstack/react-router";
import {
  DedicatedPhotoView,
  dedicatedPhotoHead,
  resolveDedicatedPhotoLoader,
} from "@/components/DedicatedPhotoView";

export const Route = createFileRoute("/$discipline/$specialty/$project/$photoId")({
  loader: ({ params }) =>
    resolveDedicatedPhotoLoader({
      rawDiscipline: params.discipline,
      rawSpecialty: params.specialty,
      rawProject: params.project,
      rawPhotoId: params.photoId,
      currentRawPath: `/${params.discipline}/${params.specialty}/${params.project}/${params.photoId}`,
    })!,
  head: ({ loaderData }) => dedicatedPhotoHead(loaderData),
  component: DedicatedPhotoRouteComponent,
  errorComponent: ({ error }: { error: any }) => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">{error?.message || String(error)}</p>
    </div>
  ),
});

function DedicatedPhotoRouteComponent() {
  const loaderData = Route.useLoaderData();
  return <DedicatedPhotoView loaderData={loaderData} />;
}
