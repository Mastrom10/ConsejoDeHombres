# 🧔⚔️ Consejo de Hombres

**La plataforma oficial donde los hombres someten sus dilemas, decisiones y ocurrencias al veredicto del Consejo.**

## 📌 ¿Qué es este proyecto?

**Consejo de Hombres** es una aplicación web social donde los hombres pueden:

1. **Postularse para ser miembros del Consejo**

   * Inician sesión (principalmente con Google).
   * Cargan una foto y un texto explicando quiénes son.
   * Otros miembros ya aprobados votan su solicitud (aprobación o rechazo).
   * Al alcanzar cierto umbral de votos con mayoría positiva, ingresan al Consejo.

2. **Crear Peticiones al Consejo**
   Solo los miembros aprobados pueden crear peticiones del tipo **“¿el Consejo de Hombres me aprueba hacer X?”**.

3. **Votar y dejar veredictos**
   Cada petición permite:

   * ❤️ Likes (popularidad)
   * 👍 Aprobación
   * 👎 Rechazo (requiere explicación obligatoria)
     Las aprobaciones y rechazos determinan si la petición queda:
   * **Aprobada**
   * **No aprobada**
   * **En revisión** (hasta alcanzar la cantidad mínima de votos)

4. **Interactuar en un ecosistema simple y entretenido**
   El objetivo es que los hombres suban fotos, videos, títulos concretos y descripciones, y la comunidad vote sí o no, siempre con la solemnidad humorística del “Consejo”.

---

## 🎯 Objetivo de la plataforma

Crear un foro moderno, mobile-friendly y escalable, donde:

* Ser parte del Consejo sea un **privilegio ganado por votación**.
* Las decisiones se aprueben por **mayoría cualificada**.
* Las peticiones más relevantes sean visibles por popularidad o recencia.
* La comunidad participe con votaciones razonadas (especialmente en los rechazos).

El espíritu es humorístico, participativo y comunitario, pero la plataforma debe ser **robusta, seria y bien diseñada** para miles de usuarios.

---

## 🧱 Funcionalidades principales

### 🔑 **Autenticación**

* Login con Google (OAuth2).
* Creación automática del perfil básico.
* Registro inicial en estado “pendiente de aprobación”.

### 📝 **Solicitud de ingreso**

* Texto de presentación.
* Foto de solicitud.
* Otros miembros pueden votar aprobar/rechazar.
* La solicitud se aprueba cuando alcanza un mínimo de votos y supera el porcentaje requerido.

### 🧔💬 **Peticiones al Consejo**

* Solo miembros aprobados pueden crearlas.
* Contenido permitido:

  * Título (una línea, obligatorio)
  * Descripción
  * Imágenes
  * Video opcional
* La comunidad vota con:

  * ❤️ Like
  * 👍 Aprobar (mensaje opcional)
  * 👎 Rechazar (mensaje obligatorio)

### 📊 **Sistema de votación**

* Configurable: cantidad mínima de votos + porcentaje necesario.
* Votos obligatoriamente únicos por usuario.
* Resultado automático al alcanzar el threshold.

### 📰 **Feeds y secciones**

* Últimas peticiones.
* Más populares.
* En revisión.
* Aprobadas.
* No aprobadas.
* Solicitudes de nuevos miembros.

### 👤 **Perfil**

* Avatar, nombre, estado de miembro.
* Estadísticas personales.
* Peticiones creadas.
* Votos emitidos.

### 🔧 **Panel de administración**

* Moderación de usuarios.
* Edición de parámetros globales.
* Gestión de peticiones problemáticas.
* Acciones sobre reportes (si un contenido fue denunciado).

---

## 🏗️ Stack tecnológico sugerido

* **Frontend:** React / Next.js (SPA/SSR), Tailwind/MUI para UI.
* **Backend:** Node.js + TypeScript (Express / NestJS).
* **Base de datos:** PostgreSQL con migraciones.
* **Autenticación:** OAuth2 (Google).
* **Infraestructura:** Docker + docker-compose.
* **Almacenamiento:** S3 o servicio equivalente para imágenes y videos.

El stack puede adaptarse según preferencia, pero se busca simplicidad + escalabilidad.

---

## 📂 Estructura del proyecto

```
/root
 ├─ /backend
 │   ├─ src/
 │   ├─ prisma / migrations / models
 │   ├─ tests
 │   └─ Dockerfile
 ├─ /frontend
 │   ├─ src/
 │   ├─ components/
 │   ├─ pages/
 │   └─ Dockerfile
 ├─ docker-compose.yml
 ├─ README.md
 └─ .env.example
```

---

## 🚀 Estado actual del proyecto

Este repositorio contiene la estructura, la documentación y el punto de partida para que una IA generadora de código pueda crear automáticamente la aplicación completa (frontend + backend + BD + auth + infra).
La idea es avanzar por etapas hasta tener un MVP funcional.

---

## 📣 Contribuciones

El proyecto está pensado como open-source / comunidad, por lo que toda PR, issue o idea es bienvenida.
Sugerencias, mejoras, nuevas funciones del “Consejo”, todo suma.

---

## 🧔⚔️ Espíritu del Consejo

Este proyecto mezcla humor, comunidad y tecnología.
No es una red social más:
es **el ritual solemne donde los hombres buscan la aprobación de sus pares para tomar decisiones estúpidas, importantes o ambas.**

> *"Que el Consejo de Hombres ilumine tus decisiones."*

