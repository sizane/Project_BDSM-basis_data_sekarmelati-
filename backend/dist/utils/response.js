export function sendSuccess(res, data, message, status = 200) {
    const body = { status: 'success', data, message, errors: null };
    return res.status(status).json(body);
}
export function sendPaginated(res, data, meta, message) {
    const body = { status: 'success', data, meta, message, errors: null };
    return res.status(200).json(body);
}
export function sendError(res, status, code, message, details) {
    const body = {
        status: 'error',
        data: null,
        message,
        errors: details === undefined ? { code } : { code, details },
    };
    return res.status(status).json(body);
}
export function buildMeta(page, perPage, total) {
    return {
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.max(1, Math.ceil(total / perPage)),
    };
}
export function offsetOf(page, perPage) {
    return (page - 1) * perPage;
}
//# sourceMappingURL=response.js.map