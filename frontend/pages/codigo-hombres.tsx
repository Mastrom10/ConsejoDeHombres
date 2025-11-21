import Header from '../components/Header';
import Link from 'next/link';

export default function CodigoHombres() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4 text-white">
            El Código de Hombres
          </h1>
          <p className="text-xl text-slate-400 font-serif italic">
            "Los principios que rigen la hermandad y la razón"
          </p>
        </div>

        <div className="card space-y-8">
          <div className="border-b border-slate-700 pb-6">
            <p className="text-slate-300 leading-relaxed">
              Este código establece los principios fundamentales que todo miembro del Consejo debe honrar.
              Su aceptación es requisito indispensable para formar parte de esta hermandad.
            </p>
          </div>

          <article className="space-y-8">
            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo I: La Razón sobre la Emoción
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Todo miembro del Consejo debe tomar decisiones basadas en la lógica y el razonamiento,
                no en impulsos emocionales. La pasión es permitida, pero nunca debe nublar el juicio.
                Un hombre que se deja llevar por la ira o la euforia desmedida no es digno de la mesa.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo II: El Respeto a la Mesa
              </h2>
              <p className="text-slate-300 leading-relaxed">
                La mesa del Consejo es sagrada. Todo debate debe mantenerse dentro de los límites del
                respeto mutuo. Los ataques personales, las ofensas gratuitas y la falta de cortesía
                son considerados faltas graves. Un caballero puede estar en desacuerdo sin ser desagradable.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo III: La Honestidad como Virtud
              </h2>
              <p className="text-slate-300 leading-relaxed">
                La mentira, el engaño y la manipulación están prohibidos. Un hombre que no puede
                defender sus argumentos con la verdad no merece estar en el Consejo. La transparencia
                es la base de la confianza entre hermanos.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo IV: El Compromiso con la Decisión
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Una vez que el Consejo ha tomado una decisión mediante votación, todo miembro debe
                respetarla y honrarla, incluso si votó en contra. La disidencia es válida durante
                el debate, pero la unidad es esencial después de la resolución.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo V: La Prohibición de la Piña en la Pizza
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Este es un principio no negociable. La piña no pertenece a la pizza. Cualquier
                intento de argumentar lo contrario será considerado herejía culinaria y puede resultar
                en la expulsión inmediata del Consejo. No hay excepciones, no hay apelaciones.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo VI: La Moderación en el Voto
              </h2>
              <p className="text-slate-300 leading-relaxed">
                El voto es un privilegio, no un derecho. Todo miembro debe ejercer su derecho al
                voto con responsabilidad y moderación. El "rage voting" está prohibido. Cada voto
                debe ser considerado, meditado y emitido con la seriedad que merece la decisión.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo VII: La Confidencialidad de la Hermandad
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Los asuntos internos del Consejo son confidenciales. Divulgar información sensible,
                exponer debates privados o traicionar la confianza de los hermanos es motivo de
                expulsión inmediata. La lealtad es la base de la hermandad.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo VIII: El Deber de la Argumentación
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Un hombre no puede simplemente decir "no" sin explicar por qué. Todo rechazo,
                toda objeción, debe venir acompañado de un argumento sólido. "Porque sí" o
                "porque no" no son respuestas válidas en el Consejo. La razón debe prevalecer.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo IX: La Prohibición del Spam y el Ruido
              </h2>
              <p className="text-slate-300 leading-relaxed">
                El Consejo no es un lugar para publicidad, spam, memes sin contexto o contenido
                que no aporte valor. Cada petición, cada comentario, debe tener un propósito.
                El ruido innecesario es una falta de respeto a los hermanos y a la mesa.
              </p>
            </section>

            <section className="border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                Artículo X: La Eternidad del Compromiso
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Una vez aceptado, este código es vinculante de por vida. No hay marcha atrás,
                no hay renuncia parcial. O eres un hombre del Consejo o no lo eres. No hay
                términos medios. La deserción es la única forma de salir, y conlleva la pérdida
                permanente de todos los privilegios y el honor de la hermandad.
              </p>
            </section>
          </article>

          <div className="border-t border-slate-700 pt-8 mt-8">
            <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-6">
              <h3 className="text-xl font-black text-amber-400 mb-3 uppercase">
                ⚠️ Advertencia Final
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Al aceptar este código, juras solemnemente cumplir con cada uno de estos principios.
                La violación de cualquiera de estos artículos puede resultar en sanciones, desde
                la pérdida temporal de privilegios hasta la expulsión permanente del Consejo.
              </p>
              <p className="text-slate-400 italic text-sm">
                "Un hombre sin código es un hombre sin honor. Un hombre sin honor no es un hombre."
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
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

