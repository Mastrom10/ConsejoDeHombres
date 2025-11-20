import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ padding: '12px 16px', borderBottom: '1px solid #1f3550', background: '#0f1b2a' }}>
      <div className="flex-between" style={{ gap: 12 }}>
        <Link href="/"><strong>🧔⚔️ Consejo de Hombres</strong></Link>
        <nav className="flex" style={{ gap: 10 }}>
          <Link href="/">Inicio</Link>
          <Link href="/solicitudes">Nuevos miembros</Link>
          <Link href="/crear-peticion">Crear petición</Link>
          <Link href="/perfil">Perfil</Link>
        </nav>
      </div>
    </header>
  );
}
