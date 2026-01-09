'use client';

import ChapterEditor from './_components/ChapterEditor';
import MatterEditor from './_components/MatterEditor';
import { useManuscriptStore } from './_store/useManuscriptStore';

export default function WritePage() {
  const activeMatterId = useManuscriptStore(state => state.activeMatterId);
  return activeMatterId ? <MatterEditor /> : <ChapterEditor />;
}
