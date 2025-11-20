import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(helmet());
app.use(apiLimiter);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl
    },
    async (_accessToken, _refresh, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google sin email'));
        const displayName = profile.displayName || 'Usuario Google';
        const avatar = profile.photos?.[0]?.value;
        const existing = await prisma.usuario.findUnique({ where: { email } });
        const user =
          existing ||
          (await prisma.usuario.create({
            data: {
              email,
              displayName,
              avatarUrl: avatar,
              estadoMiembro: EstadoMiembro.pendiente_aprobacion
            }
          }));
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
