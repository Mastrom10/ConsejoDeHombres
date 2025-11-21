import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);
  
  // Manejar errores de multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB por imagen.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Demasiados archivos. Máximo 5 imágenes.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Campo de archivo inesperado.' });
    }
    return res.status(400).json({ message: err.message || 'Error al procesar archivo' });
  }
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Error interno' });
}
