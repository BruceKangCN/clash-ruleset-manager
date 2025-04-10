FROM node:bookworm-slim AS builder

WORKDIR /workspace

COPY . .

RUN npm install

RUN npm run build

FROM node:bookworm-slim AS app

EXPOSE 3000

WORKDIR /app

VOLUME [ "./config", "./data/nodes", "./data/rules" ]

COPY --from=builder [ \
    "/workspace/package.json", \
    "/workspace/package-lock.json", \
    "./" \
]

RUN npm ci --omit dev

COPY --from=builder /workspace/build build

COPY --from=builder /workspace/config config

CMD [ "node", "build" ]
