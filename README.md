# CSP Proxy

A simple Cloudflare Worker to replace CSP headers sent by the upstream.

Needs to be configured with a environment variable `REPLACEMENTS` that defines the replacements to be made:

```
REPLACEMENTS='{"*.example.com": "worker.domain.com"}'
```
