import { Box3, Vector3 } from "three";

/*
  Centre, normale (orientée vers `viewFrom`) et dimensions de l'écran en coordonnées monde.
  La normale est la moyenne des normales du mesh ; si elle est indéfinie (écran en forme de boîte),
  on prend l'axe le plus fin de la boîte englobante.
*/
export function getScreenFrame(screen, viewFrom) {
  screen.updateWorldMatrix(true, true);
  const box = new Box3().setFromObject(screen);
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());

  const normal = new Vector3();
  screen.traverse((o) => {
    const attr = o.isMesh && o.geometry.attributes.normal;
    if (!attr) return;
    const n = new Vector3();
    const sum = new Vector3();
    for (let i = 0; i < attr.count; i++) sum.add(n.fromBufferAttribute(attr, i));
    normal.add(sum.transformDirection(o.matrixWorld));
  });
  if (normal.length() < 1e-3 || !Number.isFinite(normal.x)) {
    const min = Math.min(size.x, size.y, size.z);
    normal.set(size.x === min ? 1 : 0, size.y === min ? 1 : 0, size.z === min ? 1 : 0);
  }
  normal.normalize();
  if (viewFrom && normal.dot(new Vector3().subVectors(viewFrom, center)) < 0) normal.negate();

  const ax = Math.abs(normal.x);
  const ay = Math.abs(normal.y);
  const az = Math.abs(normal.z);
  let width, height;
  if (az >= ax && az >= ay) [width, height] = [size.x, size.y];
  else if (ax >= ay) [width, height] = [size.z, size.y];
  else [width, height] = [size.x, size.z];

  return { center, normal, width, height };
}
