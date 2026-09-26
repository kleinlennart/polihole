---
name: preview-build
description: Preview the production build locally the way GitHub Pages serves it — under the /polihole/ path, with the service worker. Use after `npm run build` to test install/update behaviour.
---

Run `npm run build` first, then:

```bash
mkdir -p /tmp/preview && ln -sfn "$PWD/out" /tmp/preview/polihole
python3 -c "from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler; import functools; \
ThreadingHTTPServer(('', 4521), functools.partial(SimpleHTTPRequestHandler, directory='/tmp/preview')).serve_forever()"
# http://localhost:4521/polihole/
```

It has to be the **threading** server, not plain `python3 -m http.server`: the worker's install fires one fetch per precached URL at once, and a single-threaded server drops enough of them that the install fails and the update never lands.
