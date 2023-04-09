import babel from "rollup-plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import external from "rollup-plugin-peer-deps-external"
// import typescript from '@rollup/plugin-typescript';
import json from "@rollup/plugin-json"
import typescript from 'rollup-plugin-typescript2';

export default [
    {
        input: "./src/index.ts",
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs'
            },
            {
                file: 'dist/index.es.js',
                format: 'es',
                exports: 'named'
            }
        ],
        plugins: [
            babel({
                exclude: 'node_modules/**',
                presets: ['@babel/preset-react']
            }),
            external(),
            resolve(),
            typescript({ compilerOptions: {lib: ["es5", "es6", "dom"], target: "es5"}}),
            json()
        ]
    }
]