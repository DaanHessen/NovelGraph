import EditorShell from './_components/EditorShell';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditorShell>
      {children}
    </EditorShell>
  );
}
