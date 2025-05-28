import { defineConfig } from 'tsup';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';


export default defineConfig({
   entry: { cards_pack_main: 'src/index.ts' },
   splitting: false,
   sourcemap: false,
   clean: false,
   target: 'chrome120',
   format: 'esm',

   legacyOutput: true,
   minify: false,
   minifyWhitespace: false,
   minifyIdentifiers: false,
   minifySyntax: false,    
   keepNames: true,

   external: [/.*get_recreated.*/],
   onSuccess: async (s) => {
      let targetFile = path.join(process.cwd(), `dist/esm/cards_pack_main.js`);
      if (!fs.existsSync(targetFile)) {
         console.log(`Failed; file ${process.cwd()} not found`);
         return;
      }
      console.log(`Processing file "${targetFile}" (commenting imports)`);

      let fileContents = fs.readFileSync(targetFile, { encoding: "utf-8" });
      fileContents = fileContents.replace(/^(\s*import\s.+?\sfrom\s.+)$/gm, `// $1`); // Comment imports
      fs.writeFileSync(targetFile, fileContents, { encoding: "utf-8" });

      console.log(`Success; rewrote file ${targetFile}`);
   }
});


