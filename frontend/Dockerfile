FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json next.config.js next-env.d.ts tailwind.config.js postcss.config.js ./
COPY pages ./pages
COPY components ./components
COPY styles ./styles
COPY public ./public

# Definir argumentos de construcción para variables de entorno
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

RUN npm install
RUN npm run build
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
