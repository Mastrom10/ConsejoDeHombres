import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Link from 'next/link';
import ImageInput from '../components/ImageInput';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RegistroSolicitud() {
  const router = useRouter();
  const [form, setForm] = useState({
    textoSolicitud: '',
    cartaSolicitud: '',
    redesSociales: {
      instagram: '',
      twitter: '',
      linkedin: '',
      facebook: '',
      otro: ''
    },
    codigoAceptado: false
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoUrl, setFotoUrl] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  // Cargar datos guardados del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('solicitud_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setForm(draft.form || form);
        if (draft.fotoUrl) {
          setFotoUrl(draft.fotoUrl);
          setFotoPreview(draft.fotoUrl);
        }
      } catch (e) {
        console.error('Error al cargar borrador:', e);
      }
    }
  }, []);
  
  // Guardar en localStorage cuando cambie el formulario
  useEffect(() => {
    const draft = {
      form,
      fotoUrl,
      timestamp: Date.now()
    };
    localStorage.setItem('solicitud_draft', JSON.stringify(draft));
  }, [form, fotoUrl]);

  const [isEditing, setIsEditing] = useState(false);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que el usuario esté logueado
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
      return;
    }

    // Cargar solicitud existente si existe
    const cargarSolicitud = async () => {
      try {
        const res = await axios.get(`${API}/solicitudes/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const solicitud = res.data;
        if (solicitud && solicitud.estadoSolicitud === 'pendiente') {
          setIsEditing(true);
          setSolicitudId(solicitud.id);
          
          // Extraer solo los nombres de usuario de las URLs de redes sociales
          let redesParsed: { instagram: string; twitter: string; linkedin: string; facebook: string; otro: string } = {
            instagram: '',
            twitter: '',
            linkedin: '',
            facebook: '',
            otro: ''
          };
          
          if (solicitud.redesSociales) {
            try {
              const redes = JSON.parse(solicitud.redesSociales);
              // Extraer nombre de usuario de cada URL
              if (redes.instagram) {
                const match = redes.instagram.match(/instagram\.com\/([^\/\?]+)/);
                redesParsed.instagram = match ? match[1] : redes.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
              }
              if (redes.twitter) {
                const match = redes.twitter.match(/twitter\.com\/([^\/\?]+)/);
                redesParsed.twitter = match ? match[1] : redes.twitter.replace(/^https?:\/\/(www\.)?twitter\.com\//, '');
              }
              if (redes.linkedin) {
                const match = redes.linkedin.match(/linkedin\.com\/in\/([^\/\?]+)/);
                redesParsed.linkedin = match ? match[1] : redes.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '');
              }
              if (redes.facebook) {
                const match = redes.facebook.match(/facebook\.com\/([^\/\?]+)/);
                redesParsed.facebook = match ? match[1] : redes.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
              }
              if (redes.otro) {
                redesParsed.otro = redes.otro;
              }
            } catch (e) {
              console.error('Error al parsear redes sociales:', e);
            }
          }
          
          setForm({
            textoSolicitud: solicitud.textoSolicitud || '',
            cartaSolicitud: solicitud.cartaSolicitud || '',
            redesSociales: redesParsed,
            codigoAceptado: solicitud.codigoAceptado || false
          });
          if (solicitud.fotoSolicitudUrl) {
            setFotoUrl(solicitud.fotoSolicitudUrl);
            setFotoPreview(solicitud.fotoSolicitudUrl);
          }
        }
      } catch (err: any) {
        // Si no hay solicitud o error 404, es normal (usuario nuevo)
        if (err.response?.status !== 404) {
          console.error('Error al cargar solicitud:', err);
        }
      }
    };

    cargarSolicitud();
  }, [router]);

  const handleFotoSelect = (file: File) => {
    setFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const subirFoto = async () => {
    if (!foto) return '';

    setSubiendoFoto(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('foto', foto);

      const response = await axios.post(
        `${API}/solicitudes/upload-foto`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.url || '';
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al subir la foto');
      return '';
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Subir foto primero
      let fotoUrlFinal = fotoUrl;
      if (foto && !fotoUrl) {
        fotoUrlFinal = await subirFoto();
        if (!fotoUrlFinal) {
          setEnviando(false);
          return;
        }
      }

      if (!fotoUrlFinal && !fotoUrl) {
        setError('Debes subir una foto para tu solicitud');
        setEnviando(false);
        return;
      }
      
      // Si estamos editando y no hay nueva foto, usar la existente
      if (isEditing && !foto && fotoUrl) {
        fotoUrlFinal = fotoUrl;
      }

      // Preparar redes sociales como JSON con URLs completas
      const redesConUrls: Record<string, string> = {};
      if (form.redesSociales.instagram.trim()) {
        redesConUrls.instagram = `https://instagram.com/${form.redesSociales.instagram.trim()}`;
      }
      if (form.redesSociales.twitter.trim()) {
        redesConUrls.twitter = `https://twitter.com/${form.redesSociales.twitter.trim()}`;
      }
      if (form.redesSociales.linkedin.trim()) {
        redesConUrls.linkedin = `https://linkedin.com/in/${form.redesSociales.linkedin.trim()}`;
      }
      if (form.redesSociales.facebook.trim()) {
        redesConUrls.facebook = `https://facebook.com/${form.redesSociales.facebook.trim()}`;
      }
      if (form.redesSociales.otro.trim()) {
        redesConUrls.otro = form.redesSociales.otro.trim();
      }
      
      const redesSocialesJson = Object.keys(redesConUrls).length > 0 
        ? JSON.stringify(redesConUrls) 
        : null;

      // Crear o actualizar la solicitud
      if (isEditing && solicitudId) {
        await axios.put(
          `${API}/solicitudes/me`,
          {
            textoSolicitud: form.textoSolicitud,
            fotoSolicitudUrl: fotoUrlFinal,
            cartaSolicitud: form.cartaSolicitud || null,
            redesSociales: redesSocialesJson || null,
            codigoAceptado: form.codigoAceptado
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/solicitudes`,
          {
            textoSolicitud: form.textoSolicitud,
            fotoSolicitudUrl: fotoUrlFinal,
            cartaSolicitud: form.cartaSolicitud || null,
            redesSociales: redesSocialesJson || null,
            codigoAceptado: form.codigoAceptado
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Limpiar el borrador después de enviar exitosamente
      localStorage.removeItem('solicitud_draft');
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <SEO
        title="Solicitud de Adhesión"
        description="Completa tu solicitud de adhesión al Consejo de Hombres. Presenta tu carta de solicitud y acepta el Código Fundacional."
        url="/registro-solicitud"
        noindex={true}
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
      <main className="flex-1 container mx-auto max-w-3xl p-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">
            {isEditing ? 'Modificar Solicitud' : 'Solicitud de Adhesión'}
          </h1>
          <p className="text-secondary">
            {isEditing 
              ? 'Modifica tu solicitud de adhesión. Los cambios serán visibles para los miembros del Consejo.'
              : 'Esta información será pública durante el proceso de evaluación. Sé honesto y claro.'}
          </p>
        </div>

        <form className="card space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded bg-red-500/20 text-red-300 text-sm border border-red-500/50">
              {error}
            </div>
          )}

          {/* Foto de solicitud */}
          <div>
            <ImageInput
              label="Foto de Solicitud"
              onImageSelect={handleFotoSelect}
              preview={fotoPreview}
              disabled={subiendoFoto}
              required
              maxSize={5}
            />
            <p className="text-xs text-slate-500 mt-1">
              Una sola foto. Máximo 5MB. Formatos: JPEG, PNG, GIF, WEBP.
            </p>
          </div>

          {/* Texto de solicitud (breve) */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Presentación Breve <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              className="input"
              placeholder="Escribe una presentación breve de ti mismo (mínimo 20 caracteres)..."
              value={form.textoSolicitud}
              onChange={(e) => setForm({ ...form, textoSolicitud: e.target.value })}
              required
              minLength={20}
            />
            <p className="text-xs text-slate-500 mt-1">
              Esta será la primera impresión que los miembros verán de ti.
            </p>
          </div>

          {/* Carta de solicitud (motivos) */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Carta de Solicitud <span className="text-slate-500">(Opcional)</span>
            </label>
            <textarea
              rows={8}
              className="input"
              placeholder="Explica tus motivos para unirte al Consejo, qué esperas aportar, por qué crees que eres digno de formar parte de esta hermandad... (mínimo 50 caracteres si decides incluirla)"
              value={form.cartaSolicitud}
              onChange={(e) => setForm({ ...form, cartaSolicitud: e.target.value })}
              minLength={form.cartaSolicitud ? 50 : 0}
            />
            <p className="text-xs text-slate-500 mt-1">
              Esta carta será visible durante el proceso de evaluación. Sé sincero y convincente.
            </p>
          </div>

          {/* Redes sociales */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">
              Redes Sociales <span className="text-slate-500">(Opcional)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Instagram</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 border border-r-0 border-slate-700 rounded-l text-slate-400 text-sm whitespace-nowrap">
                    instagram.com/
                  </span>
                  <input
                    type="text"
                    className="input text-sm rounded-l-none flex-1"
                    placeholder="tu_usuario"
                    value={form.redesSociales.instagram}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        redesSociales: { ...form.redesSociales, instagram: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Twitter/X</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 border border-r-0 border-slate-700 rounded-l text-slate-400 text-sm whitespace-nowrap">
                    twitter.com/
                  </span>
                  <input
                    type="text"
                    className="input text-sm rounded-l-none flex-1"
                    placeholder="tu_usuario"
                    value={form.redesSociales.twitter}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        redesSociales: { ...form.redesSociales, twitter: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">LinkedIn</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 border border-r-0 border-slate-700 rounded-l text-slate-400 text-sm whitespace-nowrap">
                    linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    className="input text-sm rounded-l-none flex-1"
                    placeholder="tu_perfil"
                    value={form.redesSociales.linkedin}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        redesSociales: { ...form.redesSociales, linkedin: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Facebook</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-800 border border-r-0 border-slate-700 rounded-l text-slate-400 text-sm whitespace-nowrap">
                    facebook.com/
                  </span>
                  <input
                    type="text"
                    className="input text-sm rounded-l-none flex-1"
                    placeholder="tu_perfil"
                    value={form.redesSociales.facebook}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        redesSociales: { ...form.redesSociales, facebook: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Otra red social</label>
                <input
                  type="url"
                  className="input text-sm"
                  placeholder="URL completa de otra red social"
                  value={form.redesSociales.otro}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      redesSociales: { ...form.redesSociales, otro: e.target.value }
                    })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Estas redes serán visibles durante el proceso de evaluación para que los miembros puedan conocerte mejor.
            </p>
          </div>

          {/* Aceptación del código */}
          <div className="border-t border-slate-700 pt-6">
            <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.codigoAceptado}
                  onChange={(e) => setForm({ ...form, codigoAceptado: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
                  required
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white mb-1">
                    Acepto el Código de Hombres <span className="text-red-400">*</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    He leído y acepto cumplir con todos los principios establecidos en el{' '}
                    <Link href="/codigo-hombres" target="_blank" className="text-primary hover:underline">
                      Código de Hombres
                    </Link>
                    . Entiendo que la violación de estos principios puede resultar en sanciones o expulsión.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando || subiendoFoto || !form.codigoAceptado || (!foto && !fotoUrl) || form.textoSolicitud.length < 20}
              className="btn btn-primary min-w-[120px] disabled:opacity-50"
            >
              {subiendoFoto ? 'Subiendo foto...' : enviando ? (isEditing ? 'Actualizando...' : 'Enviando...') : (isEditing ? 'Actualizar Solicitud' : 'Enviar Solicitud')}
            </button>
          </div>
        </form>
      </main>
      </div>
    </>
  );
}

