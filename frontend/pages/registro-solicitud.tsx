import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import Link from 'next/link';

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

  useEffect(() => {
    // Verificar que el usuario esté logueado
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
    }
  }, [router]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 5MB');
      return;
    }

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
      formData.append('imagenes', foto);

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

      return response.data.urls[0] || '';
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

      if (!fotoUrlFinal) {
        setError('Debes subir una foto para tu solicitud');
        setEnviando(false);
        return;
      }

      // Preparar redes sociales como JSON
      const redesFiltradas = Object.fromEntries(
        Object.entries(form.redesSociales).filter(([_, value]) => value.trim() !== '')
      );
      const redesSocialesJson = Object.keys(redesFiltradas).length > 0 
        ? JSON.stringify(redesFiltradas) 
        : null;

      // Crear la solicitud
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

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-3xl p-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">
            Solicitud de Adhesión
          </h1>
          <p className="text-secondary">
            Esta información será pública durante el proceso de evaluación. Sé honesto y claro.
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
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Foto de Solicitud <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFotoChange}
              disabled={subiendoFoto}
              className="input text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Una sola foto. Máximo 5MB. Formatos: JPEG, PNG, GIF, WEBP.
            </p>
            {fotoPreview && (
              <div className="mt-4">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border border-slate-700"
                />
              </div>
            )}
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
                <input
                  type="url"
                  className="input text-sm"
                  placeholder="https://instagram.com/tu_usuario"
                  value={form.redesSociales.instagram}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      redesSociales: { ...form.redesSociales, instagram: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Twitter/X</label>
                <input
                  type="url"
                  className="input text-sm"
                  placeholder="https://twitter.com/tu_usuario"
                  value={form.redesSociales.twitter}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      redesSociales: { ...form.redesSociales, twitter: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">LinkedIn</label>
                <input
                  type="url"
                  className="input text-sm"
                  placeholder="https://linkedin.com/in/tu_perfil"
                  value={form.redesSociales.linkedin}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      redesSociales: { ...form.redesSociales, linkedin: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Facebook</label>
                <input
                  type="url"
                  className="input text-sm"
                  placeholder="https://facebook.com/tu_perfil"
                  value={form.redesSociales.facebook}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      redesSociales: { ...form.redesSociales, facebook: e.target.value }
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Otra red social</label>
                <input
                  type="url"
                  className="input text-sm"
                  placeholder="URL de otra red social"
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
              disabled={enviando || subiendoFoto || !form.codigoAceptado || !foto || form.textoSolicitud.length < 20}
              className="btn btn-primary min-w-[120px] disabled:opacity-50"
            >
              {subiendoFoto ? 'Subiendo foto...' : enviando ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

