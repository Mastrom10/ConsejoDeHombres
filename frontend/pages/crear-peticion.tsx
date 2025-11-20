import { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CrearPeticion() {
  const [form, setForm] = useState({ titulo: '', descripcion: '', imagenes: '', videoUrl: '' });
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/peticiones`,
        {
          titulo: form.titulo,
          descripcion: form.descripcion,
          imagenes: form.imagenes.split(',').filter(Boolean),
          videoUrl: form.videoUrl || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Petición creada, se encuentra en revisión.');
      setForm({ titulo: '', descripcion: '', imagenes: '', videoUrl: '' });
    } catch (error: any) {
      setMensaje(error.response?.data?.message || 'Error al crear petición');
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <h1>Crear petición</h1>
        <form className="card" onSubmit={handleSubmit}>
          <label>Título</label>
          <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
          <label>Descripción</label>
          <textarea rows={5} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <label>Imágenes (URLs separadas por coma)</label>
          <input value={form.imagenes} onChange={(e) => setForm({ ...form, imagenes: e.target.value })} />
          <label>Video URL (opcional)</label>
          <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          <button className="btn btn-primary" type="submit">Enviar</button>
          {mensaje && <p>{mensaje}</p>}
        </form>
      </div>
    </>
  );
}
