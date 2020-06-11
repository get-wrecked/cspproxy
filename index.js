addEventListener('fetch', event => {
    event.passThroughOnException();
    event.respondWith(handleRequest(event.request));
});


async function handleRequest(request) {
    const replacements = JSON.parse(REPLACEMENTS);
    const response = await fetch(request);
    const csp = response.headers.get('content-security-policy');
    if (!csp) {
        // No CSP policy, ignore
        console.log(`no CSP policy for ${request.url}, ignoring`);
        return fetch(request);
    }
    const newCsp = replaceDomainInCsp(csp, replacements);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('content-security-policy', newCsp);
    return new Response(await response.text(), {
        headers: newHeaders,
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
