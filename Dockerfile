FROM oven/bun:1.2.10-slim AS builder

WORKDIR /workspace

COPY . .

RUN bun install && bun --bun run build

FROM oven/bun:1.2.10-slim AS app

EXPOSE 3000

WORKDIR /app

VOLUME [ "./config", "./data/nodes", "./data/rules" ]

COPY --from=builder [ \
    "/workspace/package.json", \
    "/workspace/bun.lock", \
    "./" \
]
COPY --from=builder /workspace/build build
COPY --from=builder /workspace/config config

RUN bun install --production

CMD [ "bun", "run", "./build" ]
