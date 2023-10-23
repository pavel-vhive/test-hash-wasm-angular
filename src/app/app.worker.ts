import { md5 } from 'hash-wasm';

onmessage = async (event) => {
  const files = event.data;
  console.log(`worker received ${files.length} files`);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = await file.arrayBuffer();
    const hash =  await md5(new Uint8Array(buffer));
    postMessage([hash, file]);
  }
};