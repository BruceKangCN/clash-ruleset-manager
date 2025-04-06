FROM node:bookworm-slim AS builder

WORKDIR /workspace

COPY . .

RUN npm install

RUN npm run build

FROM node:bookworm-slim AS app

EXPOSE 3000

WORKDIR /app

VOLUME [ "./config" ]

COPY --from=builder [ \
    "/workspace/build", \
    "/workspace/package.json", \
    "/workspace/package-lock.json", \
    "./" \
]

RUN npm ci --omit dev

CMD [ "node", "." ]
