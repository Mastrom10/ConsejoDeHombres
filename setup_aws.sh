#!/bin/bash

# Script de Instalación y Despliegue para AWS EC2 (Ubuntu)
# Uso: sudo ./setup_aws.sh

# 1. Actualizar el sistema
echo "🔄 Actualizando sistema..."
apt-get update && apt-get upgrade -y

# 2. Instalar Docker
echo "🐳 Instalando Docker..."
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Preparar variables de entorno (placeholder)
# NOTA: Deberás editar este archivo con tus credenciales reales después
echo "📝 Creando archivo .env..."
cat <<EOF > .env
GOOGLE_CLIENT_ID=tu_id_real_de_google
GOOGLE_CLIENT_SECRET=tu_secreto_real_de_google
GOOGLE_CALLBACK_URL=http://$(curl -s http://checkip.amazonaws.com):4000/auth/google/callback
ADMIN_EMAIL=admin@consejo.com
ADMIN_PASSWORD=admin123_secure
EOF

# 4. Levantar el proyecto
echo "🚀 Levantando servicios..."
# Asumimos que el script se corre en la raíz del proyecto clonado
docker compose up -d --build

echo "✅ ¡Despliegue completado!"
echo "Frontend disponible en: http://$(curl -s http://checkip.amazonaws.com):3000"
echo "Backend disponible en: http://$(curl -s http://checkip.amazonaws.com):4000"

