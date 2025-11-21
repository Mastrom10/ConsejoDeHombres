import Header from '../components/Header';
import Link from 'next/link';

export default function CodigoHombres() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4 text-white">
            🧔⚔️ Código Fundacional del Consejo de Hombres
          </h1>
          <p className="text-xl text-slate-400 font-serif italic mb-2">
            Estatuto Supremo de Conducta, Adhesión y Procedimiento
          </p>
          <p className="text-sm text-slate-500 uppercase tracking-widest">
            Emitido por la Alta Cámara – Archivo Oficial
          </p>
        </div>

        <div className="card space-y-10">
          {/* Preámbulo */}
          <section className="border-b border-slate-700 pb-8">
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">
              Preámbulo
            </h2>
            <p className="text-slate-300 leading-relaxed">
              El Consejo de Hombres, institución regida por principios de honor, criterio y responsabilidad, establece el presente Código Fundacional.
              Su propósito es normar las condiciones de pertenencia, la conducta de sus miembros y los procesos de deliberación que determinan las decisiones del Cuerpo.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              Estas disposiciones son de cumplimiento obligatorio para aspirantes, miembros activos y representantes de la Mesa.
            </p>
          </section>

          {/* TÍTULO I */}
          <section>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight border-b border-primary pb-3">
              Título I – Adhesión al Consejo
            </h2>
            
            <div className="space-y-6">
              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 1 — Requisito Primario de Pertenencia
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Solo podrá pertenecer al Consejo quien se identifique como hombre.
                  Este principio es condición esencial, sin excepciones.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 2 — Cámara de Ingreso
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Todo aspirante deberá someter su solicitud ante la Cámara de Ingreso, donde será evaluado mediante votación de miembros habilitados.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 3 — Identidad y Registro Biométrico
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Cada solicitante deberá presentar fotografía personal y datos básicos verificables.
                  Dichos elementos conforman el Registro Biométrico inicial de la identidad del agente.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 4 — Declaración de Intenciones
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  El aspirante acompañará su solicitud con una exposición clara de motivos que fundamenten su deseo de incorporarse al Consejo.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 5 — Proceso de Evaluación
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  La aceptación de un aspirante requerirá cumplir con:
                </p>
                <ul className="text-slate-300 leading-relaxed mt-2 ml-4 list-disc space-y-1">
                  <li>a) La cantidad mínima de votos establecida por el Alto Mando.</li>
                  <li>b) Un porcentaje favorable no inferior al 70% de las evaluaciones emitidas.</li>
                </ul>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 6 — Fundamentación de Rechazos
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Todo voto negativo deberá estar acompañado de una justificación escrita que conste en el expediente del aspirante.
                </p>
              </article>
            </div>
          </section>

          {/* TÍTULO II */}
          <section>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight border-b border-primary pb-3">
              Título II – Peticiones al Consejo
            </h2>
            
            <div className="space-y-6">
              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 7 — Naturaleza de las Peticiones
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Los miembros aprobados podrán elevar solicitudes al Consejo para requerir autorización, validación o criterio respecto de decisiones personales.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 8 — Forma de la Petición
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Toda petición deberá formularse en términos claros y binarios, de modo que la Mesa pueda pronunciarse con precisión.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 9 — Evidencia Adjunta
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Cuando la situación lo amerite, la petición deberá incluir imágenes, videos o documentación que permitan evaluar adecuadamente el caso.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 10 — Mecanismos de Participación
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Cada petición admitirá:
                </p>
                <ul className="text-slate-300 leading-relaxed mt-2 ml-4 list-disc space-y-1">
                  <li>a) Aprobación mediante voto afirmativo.</li>
                  <li>b) Rechazo mediante voto negativo acompañado de fundamento.</li>
                  <li>c) Asignación de relevancia mediante la indicación de apoyo (like).</li>
                </ul>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 11 — Validez del Veredicto
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  La resolución de una petición quedará definida cuando:
                </p>
                <ul className="text-slate-300 leading-relaxed mt-2 ml-4 list-disc space-y-1">
                  <li>a) Se alcance el umbral mínimo de votos.</li>
                  <li>b) El porcentaje de aprobación supere el mínimo establecido por la Mesa.</li>
                </ul>
              </article>
            </div>
          </section>

          {/* TÍTULO III */}
          <section>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight border-b border-primary pb-3">
              Título III – Procedimientos de Votación
            </h2>
            
            <div className="space-y-6">
              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 12 — Unidad del Voto
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Cada miembro habilitado podrá emitir un único voto por petición o solicitud de ingreso.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 13 — Transparencia Institucional
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Los votos y fundamentos quedarán registrados en los archivos internos del Consejo, disponibles para consulta conforme al protocolo vigente.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 14 — Registro de Actividad
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Toda acción de voto, aprobación o rechazo formará parte de la Hoja de Servicios del miembro, como constancia de participación activa.
                </p>
              </article>
            </div>
          </section>

          {/* TÍTULO IV */}
          <section>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight border-b border-primary pb-3">
              Título IV – Rangos y Responsabilidades
            </h2>
            
            <div className="space-y-6">
              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 15 — Rangos Operativos
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Los rangos asignados a los miembros representan su grado de participación, compromiso y trayectoria dentro del Consejo.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 16 — Honor y Conducta
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Se espera que cada miembro actúe con rectitud, mesura y responsabilidad al emitir juicios o participar en deliberaciones.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 17 — Hoja de Servicios
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  La actividad individual se reflejará en indicadores de mociones elevadas, votos emitidos y puntos de honor acumulados.
                </p>
              </article>
            </div>
          </section>

          {/* TÍTULO V */}
          <section>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight border-b border-primary pb-3">
              Título V – Baja del Consejo
            </h2>
            
            <div className="space-y-6">
              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 18 — Autodestrucción del Expediente
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  El miembro podrá solicitar la eliminación completa de su expediente.
                  Esta acción implica la desvinculación definitiva del Consejo y es considerada decisión irrevertible.
                </p>
              </article>

              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 19 — Deserción Voluntaria
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  La salida voluntaria del Consejo deberá realizarse únicamente desde el módulo correspondiente y quedará registrada en el Archivo Histórico.
                </p>
              </article>
            </div>
          </section>

          {/* TÍTULO VI */}
          <section>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight border-b border-primary pb-3">
              Título VI – Disposiciones Finales
            </h2>
            
            <div className="space-y-6">
              <article className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  Artículo 20 — Espíritu del Consejo
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  El Consejo de Hombres actúa como organismo de criterio colectivo.
                  Sus decisiones son respetadas como guía y resguardo para el bienestar, juicio y proceder responsable de sus miembros.
                </p>
              </article>
            </div>
          </section>

          {/* Clausura */}
          <section className="border-t border-slate-700 pt-8 mt-8">
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">
              Clausura
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              El presente Código Fundacional entra en vigor desde su publicación en el Archivo Oficial y se mantendrá vigente hasta que la Alta Cámara determine modificaciones.
              Su lectura y aceptación constituyen condición indispensable para la permanencia en el Consejo.
            </p>
            <div className="bg-slate-900/50 border-l-4 border-primary pl-6 py-4 rounded-r-lg">
              <p className="text-lg font-serif italic text-slate-200 leading-relaxed">
                "Un hombre sin código es un hombre sin honor. Un hombre sin honor no es un hombre."
              </p>
            </div>
          </section>

          <div className="flex justify-center gap-4 pt-8 border-t border-slate-700">
            <Link href="/login" className="btn btn-primary">
              Volver al Registro
            </Link>
            <Link href="/" className="btn btn-secondary">
              Ver el Consejo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

