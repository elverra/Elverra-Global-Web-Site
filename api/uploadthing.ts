// UploadThing disabled: simple no-op Edge handler to avoid import errors during local dev
export const config = { runtime: 'edge' };
export default async function handler(_req: Request): Promise<Response> {
  return new Response('Upload endpoint disabled', { status: 404 });
}
