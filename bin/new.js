const logger = require('@novice1/logger'),
    debug = logger.debugger('nfs:cmd:new'),
    fs = require('fs'),
    path = require('path'),
    mkdir = require('mkdirp');

const { exec: cp_exec } = require('child_process')


/**
 *
 * @param {import('commander').Command} program
 * @returns {function} action
 */
function newCmd(program) {
    /**
     * @param {string} moduleName
     */
    return function action(moduleName) {
        const opts = this.opts();
        const modulePath = path.join(process.cwd(), moduleName)
        const isBasic = opts.template == 'basic'
        const isWide = opts.template == 'wide'

        // --debug
        if (program.opts().debug) {
            require('debug').enable('nfs:*');
        }

        debug.debug(`new module: ${moduleName}`)

        if (fs.existsSync(modulePath)) {
            logger.error(`Folder "${moduleName}" already exists.`);
            return process.exit(1)
        }

        // create folder
        mkdir.sync(modulePath);

        // copy template files
        fs.cpSync(path.join(__dirname, '..', 'assets', 'templates', opts.template), modulePath, { recursive: true })

        // create package.json
        const packageJsonContent = {
            "name": `${moduleName}`,
            "version": "1.0.0",
            "description": `${opts.description || ''}`,
            "author": `${opts.author || ''}`,
            "license": `${opts.license || 'UNLICENSED'}`,
            "private": true,
            "scripts": {
                "build": "tsc",
                "dev": "nodemon",
                "lint": "eslint src/**/*.ts",
                "start": "node dist/index.js",
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            "dependencies": {}
        };
        if (isWide) {
            packageJsonContent.scripts['test'] = 'kaukau -r ts-node/register -f src --ext .spec.ts'
            packageJsonContent.scripts['test:e2e'] = 'kaukau --require ts-node/register --config test/kaukau-e2e.json'
        }
        fs.writeFileSync(path.join(modulePath, 'package.json'), JSON.stringify(packageJsonContent, null, '    '));

        // create config files
        let dotenvContent = 'PORT=8080\n'
        if (!isBasic) {
            dotenvContent += 'LOG_LEVEL=2\n'
            dotenvContent += 'LOG_DEBUG=\n'
        }
        fs.writeFileSync(path.join(modulePath, '.env'), dotenvContent);
        fs.writeFileSync(path.join(modulePath, '.eslintrc.json'), JSON.stringify({
            "env": {
                "browser": true,
                "es6": true
            },
            "extends": [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended"
            ],
            "parser": "@typescript-eslint/parser",
            "parserOptions": {
                "ecmaVersion": 6,
                "sourceType": "module"
            },
            "plugins": [
                "@typescript-eslint"
            ],
            "rules": {
                "quotes": [1, "single"],
                "quote-props": [1, "as-needed"],
                "@typescript-eslint/no-unused-vars": ["error", { "ignoreRestSiblings": true }]
            }
        }, null, '    '));
        fs.writeFileSync(path.join(modulePath, 'nodemon.json'), JSON.stringify({
            "watch": [
                "src",
                ".env",
                ".env.development.local"
            ],
            "ext": "ts,json",
            "ignore": [
                "src/**/*.spec.ts"
            ],
            "exec": "dotenvx run -- ts-node ./src/index.ts"
        }, null, '    '));

        // install dependencies
        let installCommands = `cd ${modulePath} && \
        npm i @dotenvx/dotenvx @novice1/api-doc-generator @novice1/frame @novice1/logger @novice1/routing tslib && \
        npm i -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint@8.57.0 nodemon ts-node typescript && \
        npm i joi`;
        if (isWide) {
            installCommands += ` && \
            npm i -D @types/chai @types/mocha @types/supertest chai@4 kaukau supertest`
        }
        const cp = cp_exec(installCommands);

        logger.info(`installing dependencies`);
    };
}

module.exports = newCmd;
