/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly KV: KVNamespace;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
