const SENSITIVE_KEY = /pass|token|secret|authorization|hash|cookie/i;
function redact(value, depth = 0) {
    if (value === null || typeof value !== 'object')
        return value;
    if (depth > 4)
        return '[...]';
    if (Array.isArray(value))
        return value.map((v) => redact(v, depth + 1));
    const out = {};
    for (const [key, v] of Object.entries(value)) {
        out[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(v, depth + 1);
    }
    return out;
}
function serializeError(err) {
    if (err === undefined)
        return undefined;
    if (err instanceof Error) {
        const extra = err;
        return { name: err.name, message: err.message, code: extra.code, number: extra.number, stack: err.stack };
    }
    return { message: String(err) };
}
function write(level, message, err, meta) {
    const line = JSON.stringify({
        time: new Date().toISOString(),
        level,
        message,
        ...(meta ? { meta: redact(meta) } : {}),
        ...(err !== undefined ? { error: serializeError(err) } : {}),
    });
    if (level === 'error')
        console.error(line);
    else if (level === 'warn')
        console.warn(line);
    else
        console.log(line);
}
export const logger = {
    info: (message, meta) => write('info', message, undefined, meta),
    warn: (message, meta) => write('warn', message, undefined, meta),
    error: (message, err, meta) => write('error', message, err, meta),
};
//# sourceMappingURL=logger.js.map