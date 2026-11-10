import { env } from 'cloudflare:workers';

/** Verify before processing. Use id as a unique business-event key in the DB. */
export async function readWebsiteEvent(request: Request): Promise<{id:string;triggerId:string;inputs:Record<string,unknown>}> {
  const binding = (env as {REVAMP_CONNECTORS?:{verifyEvent(body:string,signature:string):Promise<boolean>}}).REVAMP_CONNECTORS;
  if (!binding || request.method !== 'POST' || !request.body) throw new Error('Invalid website event');
  const reader=request.body.getReader(); const chunks:Uint8Array[]=[]; let size=0;
  try { while(true) { const next=await reader.read(); if(next.done) break; size+=next.value.byteLength; if(size>120_000) throw new Error('Website event too large'); chunks.push(next.value); } }
  finally { await reader.cancel(); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  const body=new TextDecoder().decode(bytes);
  if (!await binding.verifyEvent(body,request.headers.get('x-revamp-event-signature') ?? '')) throw new Error('Invalid website event');
  const event=JSON.parse(body);
  if (event.path !== new URL(request.url).pathname) throw new Error('Invalid website event destination');
  return event;
}
