import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 5) {
      setMensaje('Máximo 5 imágenes permitidas');
      setStatus('error');
      return;
    }

    const newFiles = [...selectedImages, ...files];
    setSelectedImages(newFiles);

    // Crear previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
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
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageSelect}
              disabled={selectedImages.length >= 5 || uploadingImages}
              className="input text-sm"
            />
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
  );
}