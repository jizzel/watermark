import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
      return cb(
        new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
        ),
        false,
      );
    }
    cb(null, true);
  },
};
