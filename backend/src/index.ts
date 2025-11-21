import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { env } from './config/env';
import { connectPrisma, prisma } from './config/prisma';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimit';
import authRoutes from './routes/authRoutes';
import solicitudRoutes from './routes/solicitudRoutes';
import peticionRoutes from './routes/peticionRoutes';
import adminRoutes from './routes/adminRoutes';
import { EstadoMiembro, RolUsuario } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://elconsejodehombres.net',
  'https://www.elconsejodehombres.net'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // peticiones tipo curl / Postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Permitir frontends desplegados en Railway (*.up.railway.app)
      if (origin.endsWith('.up.railway.app')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(helmet());
app.use(apiLimiter);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl
    },
    async (_accessToken: string, _refresh: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google sin email'));
        const displayName = profile.displayName || 'Usuario Google';
        const avatar = profile.photos?.[0]?.value;
        const existing = await prisma.usuario.findUnique({ where: { email } });
        let user = existing;
        if (!user) {
          const totalUsuarios = await prisma.usuario.count();
          const esPrimerosCien = totalUsuarios < 100;
          user = await prisma.usuario.create({
            data: {
              email,
              displayName,
              avatarUrl: avatar,
              estadoMiembro: esPrimerosCien ? EstadoMiembro.miembro_aprobado : EstadoMiembro.pendiente_aprobacion
            }
          });
        } else {
          // Actualizar avatar y nombre para mantener el perfil sincronizado con Google
          user = await prisma.usuario.update({
            where: { id: user.id },
            data: {
              displayName,
              ...(avatar ? { avatarUrl: avatar } : {})
            }
          });
        }
        return done(null, user);
      } catch (e) {
        return done(e as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.usuario.findUnique({ where: { id } });
  done(null, user);
});

app.use(passport.initialize());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/solicitudes', solicitudRoutes);
app.use('/peticiones', peticionRoutes);
app.use('/admin', adminRoutes);
app.use(errorHandler);

connectPrisma().then(() => {
  app.listen(env.port, () => console.log(`API escuchando en ${env.port}`));
});

export default app;