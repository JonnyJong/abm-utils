const ts = require('@rollup/plugin-typescript');

module.exports = [
	{
		input: './src/index.ts',
		output: [
			{
				file: './dist/index.js',
				format: 'cjs',
				sourcemap: true,
			},
      {
        file: './dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: './dist/index.amd.js',
        format: 'amd',
        sourcemap: true,
      },
      {
        file: './dist/index.umd.js',
        format: 'amd',
        sourcemap: true,
      },
		],
		plugins: [ts()],
		external: ['@types/node'],
	},
];
