/** Log errors without dumping axios config (Authorization headers, tokens). */
export function logError(context, err) {
  const message =
    err?.response?.data?.message ??
    err?.message ??
    (typeof err === 'string' ? err : 'Request failed');
  console.error(context, message);
}
