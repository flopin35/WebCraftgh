import { useEffect, useState } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase';

export function useAdminFileUrls(uploadedFiles) {
  const [fileUrls, setFileUrls] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!uploadedFiles?.length) {
      setFileUrls({});
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);

    async function resolveUrls() {
      const resolved = {};

      await Promise.all(
        uploadedFiles.map(async (file) => {
          const key = file.storagePath || file.url || file.name;

          if (file.url) {
            resolved[key] = file.url;
            return;
          }

          if (!file.storagePath || !storage) {
            return;
          }

          try {
            resolved[key] = await getDownloadURL(ref(storage, file.storagePath));
          } catch {
            resolved[key] = null;
          }
        })
      );

      if (!cancelled) {
        setFileUrls(resolved);
        setIsLoading(false);
      }
    }

    resolveUrls();

    return () => {
      cancelled = true;
    };
  }, [uploadedFiles]);

  return { fileUrls, isLoading };
}
