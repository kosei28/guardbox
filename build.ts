import path from 'node:path';
import { Glob, file } from 'bun';
import { build } from 'esbuild';
import type { Plugin, PluginBuild } from 'esbuild';

const addJsExtension: Plugin = {
    name: 'add-js-extension',
    setup(build: PluginBuild) {
        build.onResolve({ filter: /.*/ }, async (args) => {
            if (args.importer) {
                let tsPath = `${path.join(args.resolveDir, args.path)}.ts`;
                let importPath: string | undefined;
                if (await file(tsPath).exists()) {
                    importPath = `${args.path}.js`;
                } else {
                    tsPath = path.join(args.resolveDir, args.path, 'index.ts');
                    if (await file(tsPath).exists()) {
                        importPath = `${args.path}/index.js`;
                    }
                }
                if (importPath !== undefined) {
                    return { path: importPath, external: true };
                }
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
