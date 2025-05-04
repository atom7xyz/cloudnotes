import { memo } from 'react';
import { ZoomProvider } from '@/lib/contexts/ZoomContext';
import { TabsProvider } from '@/lib/contexts/TabsContext';
import { EditHistoryProvider } from '@/lib/contexts/EditHistoryContext';
import FileReaderContent from '@/components/reader/FileReaderContent';

// Wrapped FileReader with ZoomProvider, TabsProvider and EditHistoryProvider
const FileReader = memo(() => {
  return (
    <TabsProvider>
      <ZoomProvider initialZoom={150}>
        <EditHistoryProvider>
          <FileReaderContent />
        </EditHistoryProvider>
      </ZoomProvider>
    </TabsProvider>
  );
});

FileReader.displayName = 'FileReader';

export default FileReader; 