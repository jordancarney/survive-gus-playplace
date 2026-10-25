# vendor/

Third-party code, committed so the game has nothing to install and keeps working offline
and without a CDN.

## three.module.js

[Three.js](https://threejs.org) r169, the unmodified ESM build from
`https://unpkg.com/three@0.169.0/build/three.module.js`. MIT licensed — the license header
is at the top of the file.

`index.html` maps the bare specifier `three` to this file with an import map, so game
modules `import * as THREE from 'three'` exactly as they would with a bundler, and there is
still no build step.

### Upgrading

Download the new build over the old one and bump the revision in the note above:

```bash
curl -sL -o vendor/three.module.js https://unpkg.com/three@0.XXX.0/build/three.module.js
```

Then load the game and check the console — Three.js warns loudly about removed APIs, and
`js/` is small enough to fix by hand.
