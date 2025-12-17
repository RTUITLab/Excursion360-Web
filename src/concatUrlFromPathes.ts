export function concatUrlFromPathes(...pathes: string[]) {
  return pathes.map((path, i) => {
    if (i > 0) {
      while (path.startsWith('/')) {
        path = path.substring(1, path.length);
      }
    }
    if (i < pathes.length - 1) {
      while (path.endsWith('/')) {
        path = path.substring(0, path.length - 1);
      }
    }
    return path;
  }).join("/");
}