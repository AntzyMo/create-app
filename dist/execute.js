"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kolorist_1 = require("kolorist");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const cwd = process.cwd();
const templatePath = (...dir) => (0, path_1.resolve)(__dirname, '../template', ...dir);
const execute = (options) => {
    const { projectName, pickPresets, hasProjectDir } = options;
    const root = (0, path_1.join)(cwd, projectName);
    if (hasProjectDir) {
        (0, fs_extra_1.removeSync)(root);
    }
    else {
        (0, fs_extra_1.ensureDirSync)(root);
    }
    if (pickPresets === 'react') {
        (0, fs_extra_1.copySync)(templatePath('typescript-react'), root);
    }
    console.log('\nDone. Now run:\n');
    if (root !== cwd) {
        console.log(`  ${(0, kolorist_1.bold)((0, kolorist_1.green)(`cd ${(0, path_1.relative)(cwd, root)}`))}`);
    }
    console.log(`  ${(0, kolorist_1.bold)((0, kolorist_1.green)('pnpm install'))}\n\n`);
    // exec('pnpm i', {
    //   cwd: root
    // }, (err, studo) => {
    //   if (err) {
    //     console.log(err)
    //   }
    //   console.log(studo, 'studo')
    // })
};
exports.default = execute;
