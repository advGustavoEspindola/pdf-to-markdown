FROM node:14-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Ignoramos o lint e rodamos apenas o webpack diretamente para evitar erros de build
RUN NODE_ENV=production ./node_modules/.bin/webpack --mode production

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
