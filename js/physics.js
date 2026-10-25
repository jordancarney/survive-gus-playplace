// Collision for anything that walks: a circle sliding against axis-aligned boxes.
//
// A collider is { minX, maxX, minZ, maxZ, minY, maxY } — see PlayPlace.addBlock. Movement
// only cares about the XZ footprint and whether the box is tall enough to bump into.

// Slide a circle of `radius` to (x, z), pushing out of any box it ends up inside. Two passes,
// because sliding out of one box can push you into another.
export function resolveCircle(colliders, x, z, radius, feetY, headY) {
  for (let pass = 0; pass < 2; pass++) {
    for (const c of colliders) {
      if (headY < c.minY || feetY > c.maxY) continue;   // stepped over it or under it
      const nx = Math.max(c.minX, Math.min(x, c.maxX));
      const nz = Math.max(c.minZ, Math.min(z, c.maxZ));
      const dx = x - nx;
      const dz = z - nz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= radius * radius) continue;

      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        x = nx + (dx / d) * radius;
        z = nz + (dz / d) * radius;
      } else {
        // Dead centre: push out along whichever axis is the shorter escape.
        const toL = x - c.minX, toR = c.maxX - x;
        const toB = z - c.minZ, toF = c.maxZ - z;
        const m = Math.min(toL, toR, toB, toF);
        if (m === toL) x = c.minX - radius;
        else if (m === toR) x = c.maxX + radius;
        else if (m === toB) z = c.minZ - radius;
        else z = c.maxZ + radius;
      }
    }
  }
  return { x, z };
}
