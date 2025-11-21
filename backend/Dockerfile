FROM node:20-alpine AS builder
WORKDIR /app
# Instalar dependencias de sistema necesarias para Prisma y compilación
RUN apk add --no-cache openssl libc6-compat

COPY package.json tsconfig.json prisma ./
COPY prisma ./prisma
RUN npm install
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
# Instalar dependencias de sistema en la imagen final también
RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
ENV PORT=4000
EXPOSE 4000
# Usamos npx prisma migrate deploy para asegurar que la DB tenga las tablas
# y luego iniciamos la app
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]
