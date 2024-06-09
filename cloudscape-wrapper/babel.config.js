module.exports = {
    env: {
        production: {
            presets: [["@babel/env", { modules: false }], "@babel/react"],
        },
        test: {
            presets: [
                "@babel/env",
                "@babel/preset-react",
                "@babel/preset-typescript"
            ],
        },
    },
};