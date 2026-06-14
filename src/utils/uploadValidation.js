const EXTENSION_MIME_MAP = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

export function guessMimeTypeFromFileName(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? EXTENSION_MIME_MAP[extension] ?? '' : '';
}

export function resolveUploadContentType(file) {
  if (file.type) {
    return file.type;
  }

  return guessMimeTypeFromFileName(file.name);
}

export function isAllowedUploadFile(file, category, config) {
  const contentType = resolveUploadContentType(file);
  const acceptedTypes = config.accept.split(',').map((type) => type.trim());

  if (contentType) {
    const matchesMime = acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        return contentType.startsWith(type.replace('/*', '/'));
      }
      return contentType === type;
    });

    if (matchesMime) {
      return null;
    }
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = {
    logo: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
    reference: ['png', 'jpg', 'jpeg', 'webp'],
    document: ['pdf', 'png', 'jpg', 'jpeg'],
  };

  if (extension && allowedExtensions[category]?.includes(extension)) {
    return null;
  }

  return `${config.label} file type is not supported. Use PNG, JPG, WEBP, SVG, or PDF.`;
}
