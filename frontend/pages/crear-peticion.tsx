import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CrearPeticion() {
  const router = useRouter();
  const [form, setForm] = useState({ titulo: '', descripcion: '', imagenes: [] as string[], videoUrl: '' });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.estadoMiembro !== 'miembro_aprobado') {
      setIsAllowed(false);
    } else {
      setIsAllowed(true);
    }
  }, [router]);

  // Cleanup de previews cuando el componente se desmonte
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleImageSelect = (file: File) => {
    if (selectedImages.length >= 5) {
      setMensaje('Máximo 5 imágenes permitidas');
      setStatus('error');
      return;
    }

    const newFiles = [...selectedImages, file];
    setSelectedImages(newFiles);

    // Crear preview
    const preview = URL.createObjectURL(file);
    setImagePreviews([...imagePreviews, preview]);
  };

  const handleFileInputSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => handleImageSelect(file));
  };

  const removeImage = (index: number) => {
    const newSelected = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newSelected);
    setImagePreviews(newPreviews);
    // Revocar URL del objeto para liberar memoria
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append('imagenes', file);
      });

      const response = await axios.post(
        `${API}/peticiones/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.urls || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMensaje('');

    try {
      const token = localStorage.getItem('token');
      
      // Subir imágenes primero
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      // Crear la petición con las URLs de las imágenes
      await axios.post(
        `${API}/peticiones`,
        {
          titulo: form.titulo,
          descripcion: form.descripcion,
          imagenes: imageUrls,
          videoUrl: form.videoUrl || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus('success');
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      setStatus('error');
      setMensaje(error.response?.data?.message || error.message || 'Error al crear petición');
    }
  };

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md text-center p-8">
            <span className="text-4xl mb-4 block">🔒</span>
            <h1 className="text-2xl mb-2">Acceso Restringido</h1>
            <p className="text-secondary mb-6">
              Solo los miembros aprobados por el Consejo pueden elevar nuevas peticiones a la mesa.
            </p>
            <Link href="/" className="btn btn-primary">Volver al inicio</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Crear Petición"
        description="Presenta tu caso ante el Consejo de Hombres. Crea una petición para ser votada por los miembros de la comunidad."
        url="/crear-peticion"
        noindex={true}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
      <main className="flex-1 container mx-auto max-w-2xl p-4 py-12">
        <h1 className="text-3xl mb-2 text-white">Crear Petición</h1>
        <p className="text-secondary mb-8">Presenta tu caso ante el Consejo. Sé claro y respetuoso.</p>

        <form className="card space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Título de la Petición</label>
            <input 
              className="input" 
              placeholder="Ej: Prohibir ponerle piña a la pizza"
              value={form.titulo} 
              onChange={(e) => setForm({ ...form, titulo: e.target.value })} 
              required 
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Descripción Detallada</label>
            <textarea 
              className="input min-h-[150px]" 
              placeholder="Explica tus motivos y argumentos..."
              value={form.descripcion} 
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Imágenes (Opcional) - Máximo 5
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    handleFileInputSelect({ target } as React.ChangeEvent<HTMLInputElement>);
                  };
                  input.click();
                }}
                disabled={selectedImages.length >= 5 || uploadingImages}
                className="btn btn-secondary text-sm disabled:opacity-50"
              >
                📁 Seleccionar archivos
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                      video: { facingMode: 'environment' } // Cámara trasera por defecto
                    });
                    
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.autoplay = true;
                    video.playsInline = true;
                    
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
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
                          handleImageSelect(file);
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
                  } catch (err) {
                    console.error('Error al acceder a la cámara:', err);
                    setMensaje('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
                    setStatus('error');
                  }
                }}
                disabled={selectedImages.length >= 5 || uploadingImages}
                className="btn btn-secondary text-sm disabled:opacity-50"
              >
                📷 Usar cámara
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Formatos permitidos: JPEG, PNG, GIF, WEBP. Tamaño máximo: 5MB por imagen.
            </p>
            
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Video URL (Opcional)</label>
            <input 
              className="input text-sm" 
              placeholder="YouTube, Vimeo..."
              value={form.videoUrl} 
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} 
            />
          </div>

          {status === 'error' && (
            <div className="p-3 rounded bg-red-500/20 text-red-300 text-sm border border-red-500/50">
              {mensaje}
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 rounded bg-green-500/20 text-green-300 text-sm border border-green-500/50">
              ¡Petición creada con éxito! Redirigiendo...
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/" className="btn btn-secondary">Cancelar</Link>
            <button 
              className="btn btn-primary min-w-[120px]" 
              type="submit"
              disabled={status === 'loading' || status === 'success' || uploadingImages}
            >
              {uploadingImages ? 'Subiendo imágenes...' : status === 'loading' ? 'Enviando...' : 'Publicar Petición'}
            </button>
          </div>
        </form>
      </main>
      </div>
    </>
  );
}