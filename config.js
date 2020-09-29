const path = require("path");
const dirPath = path.join(__dirname);
require("@babel/register")({
    presets: [
        [require.resolve("@babel/preset-env")],
        [
            {
                "preset-env": {},
                "transform-runtime": {},
                "styled-jsx": {},
                "class-properties": {},
            },
        ],
    ],
    plugins: [
        [require.resolve("@babel/plugin-transform-runtime")],
        [
            require.resolve("babel-plugin-module-resolver"),
            {
                alias: {
                    "~": dirPath,
                },
            },
        ],
    ],
    ignore: ["node_modules"],
});