addEventListener('fetch', event => {
    event.passThroughOnException();
    event.respondWith(handleRequest(event.request));
});


async function handleRequest(request) {
    const replacements = JSON.parse(REPLACEMENTS);
    // Rewrite origin
    const newRequestHeaders = new Headers(request.headers);
    if (request.method === 'POST' && typeof ORIGIN !== 'undefined') {
        newRequestHeaders.set('origin', ORIGIN);
    }
    const newRequest = new Request(request, {headers: newRequestHeaders});
    const response = await fetch(newRequest);
    const csp = response.headers.get('content-security-policy');
    if (!csp) {
        // No CSP policy, ignore
        return response;
    }
    const newCsp = replaceDomainInCsp(csp, replacements);
    const newResponseHeaders = new Headers(response.headers);
    newResponseHeaders.set('content-security-policy', newCsp);
    return new Response(await response.text(), {
        headers: newResponseHeaders,
    });
}

function replaceDomainInCsp(csp, replacements) {
    // Super dummy replacement, hopefully good enough
    for (const [key, val] of Object.entries(replacements)) {
        const safeKey = key.replace('*', '\\*');
        const regex = new RegExp(safeKey, 'g');
        csp = csp.replace(regex, val);
    }
    return csp;
}
