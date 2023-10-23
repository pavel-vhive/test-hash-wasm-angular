import { Component } from '@angular/core';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

@Injectable()
export class AppComponent {
  title = 'test-hash-wasm-angular';

  constructor() { }

  onFileSelected(event: any): void {
    const cpuCores = navigator.hardwareConcurrency ?? 1;
    const files = event.target.files;
    const numFiles = files.length;
    const chunkSize = Math.ceil(numFiles / cpuCores); // Number of files per chunk
    console.log(`files=${numFiles}, cores=${cpuCores}, chunks=${chunkSize}`);
    const fileChunks = this.splitFilesIntoChunks(files, chunkSize);
    const numWorkers = fileChunks.length;
    const workers: Worker[] = [];

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(new URL('./app.worker', import.meta.url));
      worker.onmessage = (event: MessageEvent) => {
        const processedData = event.data;
        const hash = processedData[0];
        const file = processedData[1];
        console.log(`file=${file.name}, hash=${hash}`);
      };
      workers.push(worker);
    }

    // Assign each worker a chunk of files to process
    for (let i = 0; i < numWorkers; i++) {
      workers[i].postMessage(fileChunks[i]);
    }
  }

  splitFilesIntoChunks(files: FileList, chunkSize: number): File[][] {
    const chunks: File[][] = [];
    let currentChunk: File[] = [];

    for (let i = 0; i < files.length; i++) {
      currentChunk.push(files[i]);

      if (currentChunk.length === chunkSize || i === files.length - 1) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    }

    return chunks;
  }
}
