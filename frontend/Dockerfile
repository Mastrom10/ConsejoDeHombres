FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json next.config.js next-env.d.ts ./
COPY pages ./pages
COPY components ./components
COPY styles ./styles
RUN npm install
RUN npm run build
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
