import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { User } from '../data/mock';

export async function exportMyData(profile: User): Promise<void> {
  const json = JSON.stringify(profile, null, 2);
  const filename = 'neighbor-profile-export.json';

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export your data' });
  }
}
