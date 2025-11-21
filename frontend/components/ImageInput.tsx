import { useRef, useState } from 'react';

type ImageInputProps = {
  onImageSelect: (file: File) => void;
  preview?: string;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en MB
  label?: string;
  required?: boolean;
};

export default function ImageInput({
  onImageSelect,
  preview,
  disabled = false,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  multiple = false,
  maxSize = 5,
  label,
  required = false,
}: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (file: File) => {
    setError('');
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`La imagen no puede ser mayor a ${maxSize}MB`);
      return;
    }

    onImageSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // 'user' para frontal, 'environment' para trasera
      });
      
      // Crear un elemento de video temporal
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      // Crear un canvas para capturar la imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Esperar a que el video esté listo
      video.onloadedmetadata = () => {
        // No necesitamos configurar el canvas aquí, lo haremos al capturar
        
        // Crear un modal para mostrar la cámara
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4';
        
        const videoContainer = document.createElement('div');
        videoContainer.className = 'relative max-w-2xl w-full';
        
        const previewVideo = document.createElement('video');
        previewVideo.srcObject = stream;
        previewVideo.autoplay = true;
        previewVideo.playsInline = true;
        previewVideo.className = 'w-full rounded-lg';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-4 mt-4 justify-center';
        
        const captureButton = document.createElement('button');
        captureButton.textContent = 'Capturar';
        captureButton.className = 'btn btn-primary px-6 py-3 text-lg';
        captureButton.onclick = () => {
          if (!ctx) return;
          
          // Obtener dimensiones del video
          const videoWidth = previewVideo.videoWidth;
          const videoHeight = previewVideo.videoHeight;
          
          // Calcular el tamaño cuadrado (usar el lado más corto)
          const size = Math.min(videoWidth, videoHeight);
          
          // Calcular el offset para centrar el recorte
          const offsetX = (videoWidth - size) / 2;
          const offsetY = (videoHeight - size) / 2;
          
          // Configurar el canvas como cuadrado
          canvas.width = size;
          canvas.height = size;
          
          // Dibujar la imagen recortada y centrada
          ctx.drawImage(
            previewVideo,
            offsetX, offsetY, size, size, // Recorte del video (source)
            0, 0, size, size // Dibujo en el canvas (destination)
          );
          
          stream.getTracks().forEach(track => track.stop());
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
              handleFileSelect(file);
            }
            document.body.removeChild(modal);
          }, 'image/jpeg', 0.9);
        };
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.className = 'btn btn-secondary px-6 py-3 text-lg';
        cancelButton.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        };
        
        buttonContainer.appendChild(captureButton);
        buttonContainer.appendChild(cancelButton);
        
        videoContainer.appendChild(previewVideo);
        modal.appendChild(videoContainer);
        modal.appendChild(buttonContainer);
        
        document.body.appendChild(modal);
      };
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
      // Si falla la cámara, abrir el selector de archivos
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="btn btn-secondary text-sm disabled:opacity-50"
        >
          📁 Seleccionar archivo
        </button>
        
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={disabled}
          className="btn btn-secondary text-sm disabled:opacity-50"
        >
          📷 Usar cámara
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />
      
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
      
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="w-48 h-48 object-cover rounded-lg border border-slate-700"
          />
        </div>
      )}
    </div>
  );
}

