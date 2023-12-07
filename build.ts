import { file, Glob } from 'bun';
import path from 'node:path';
import { build } from 'esbuild';
import type { Plugin, PluginBuild } from 'esbuild';

const addJsExtension: Plugin = {
    name: 'add-js-extension',
    setup(build: PluginBuild) {
        build.onResolve({ filter: /.*/ }, async (args) => {
            if (args.importer) {
                let tsPath = `${path.join(args.resolveDir, args.path)}.ts`;
                let importPath = '';
                if (await file(tsPath).exists()) {
                    importPath = `${args.path}.js`;
                } else {
                    tsPath = path.join(args.resolveDir, args.path, `index.ts`);
                    if (await file(tsPath).exists()) {
                        importPath = `${args.path}/index.js`;
                    }
                }
                return { path: importPath, external: true };
            }
        });
    },
};

build({
    entryPoints: [...new Glob('./src/**/*.ts').scanSync('.')],
    outbase: './src',
    outdir: './dist',
    platform: 'node',
    format: 'esm',
    bundle: true,
    plugins: [addJsExtension],
});
