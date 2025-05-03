import { NoteApp } from "@/components/note-app";

export default async function NotePage({
  params,
}: {
  params: { slug: string[] };
}) {
  const slugPath = params.slug.join("/");
  return <NoteApp activeNoteId={slugPath} />;
}
