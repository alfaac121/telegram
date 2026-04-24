FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Exponer el puerto de Vite
EXPOSE 5173

# El código se montará a través de volúmenes en dev, pero dejamos esto como fallback
COPY . .

# Iniciar servidor de desarrollo de Vite
CMD ["npm", "run", "dev"]
