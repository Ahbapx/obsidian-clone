import { NoteApp } from "@/components/note-app";

export default async function NotePage({
  params,
}: {
  params: { slug: string[] };
}) {
  const awaitedParams = await params;
  const slugPath = awaitedParams.slug.join("/");
  return <NoteApp activeNoteId={slugPath} />;
}
