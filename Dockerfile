FROM node:17-alpine as builder

WORKDIR /opt/app

COPY package*.json ./

RUN npm install

COPY . .
COPY ./build/entrypoint.sh entrypoint.sh

RUN npm run build

FROM node:17-alpine

WORKDIR /opt/app

COPY --from=builder /opt/app/node_modules /opt/app/node_modules
COPY --from=builder /opt/app/dist /opt/app/dist
COPY --from=builder /opt/app/entrypoint.sh /opt/app/entrypoint.sh

ENTRYPOINT ["/opt/app/entrypoint.sh"]
