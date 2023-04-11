export function envPrefix(resource: string) {
  return `${process.env.NODE_ENV}-${resource}`;
}
