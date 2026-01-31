import { NextFunction, Request, Response } from 'express';

const ALLOWED_IMAGE_FILE_TYPES = ['image/png', 'image/jpeg'];
const ALLOWED_DOCUMENT_FILE_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf'];

export const validateFileTypes = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];

    for (const file of files) {
      const mimeType = file.mimetype.toLowerCase();
      const extension = file.name.split('.').pop()?.toLowerCase();

      const isValidMimeType = allowedTypes.includes(mimeType);
      const isValidExtension = extension && ALLOWED_EXTENSIONS.includes(extension);

      if (!isValidMimeType || !isValidExtension) {
        return res.status(400).json({
          error: 'INVALID_FILE_TYPE',
          message: `Only ${allowedTypes.join(', ')} files are allowed`
        });
      }
    }

    next();
  };
};

export const teamLogoFileValidator = validateFileTypes(ALLOWED_IMAGE_FILE_TYPES);

export const teamDocumentFileValidator = validateFileTypes(ALLOWED_DOCUMENT_FILE_TYPES);
