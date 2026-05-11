/**
 * Tiny structured logger.
 *
 * Goal: replace `console.*` calls at high-signal sites (webhooks, payment
 * providers, race-prone server actions) with a uniform shape that's easy to
 * grep, easy to pipe into a log aggregator later, and includes a context
 * object instead of inline string interpolation.
 *
 * Drop-in replacement for the most common console.* calls:
 *   logger.info("airtime purchase", { userId, network, amount })
 *   logger.warn("refund failed", { redemptionId, error })
 *   logger.error("rpc failed", { fn: "spend_points", error })
 *
 * No external dependency — emits JSON-style lines to stdout/stderr that
 * Vercel/Supabase log forwarders can ingest as-is.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type Context = Record<string, unknown> | undefined;

interface LogEntry {
  level: LogLevel;
  msg: string;
  ts: string;
  ctx?: Record<string, unknown>;
}

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
}

function normalize(ctx: Context): Record<string, unknown> | undefined {
  if (!ctx) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(ctx)) {
    out[k] = serialize(v);
  }
  return out;
}

function emit(level: LogLevel, msg: string, ctx?: Context) {
  const entry: LogEntry = {
    level,
    msg,
    ts: new Date().toISOString(),
  };
  const normalized = normalize(ctx);
  if (normalized) entry.ctx = normalized;
  const line = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  debug: (msg: string, ctx?: Context) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: Context) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: Context) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: Context) => emit("error", msg, ctx),
};
