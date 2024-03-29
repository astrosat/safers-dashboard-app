# build
FROM node:14-alpine AS node
ARG REACT_APP_API
WORKDIR /usr/app/src
COPY ./ /usr/app/src

RUN npm i 
RUN npm run build

# runtime
FROM nginx:1.21-alpine
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=node /usr/app/src/build /etc/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
