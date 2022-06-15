"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = __importDefault(require("prompts"));
const kolorist_1 = require("kolorist");
const minimist_1 = __importDefault(require("minimist"));
const fs_1 = require("fs");
const argv = (0, minimist_1.default)(process.argv.slice(2));
const targetDir = argv._[0];
const defaultProjectName = targetDir || 'create-app';
/* 判断这个目录是否存在 并判断里面是否有文件 */
const hasProjectDir = (dir) => {
    return (0, fs_1.existsSync)(dir) && !!(0, fs_1.readdirSync)(dir).length;
};
const options = [
    {
        name: 'projectName',
        type: targetDir ? null : 'text',
        message: 'Project Name:',
        initial: defaultProjectName
    },
    {
        name: 'hasProjectDir',
        type: () => (hasProjectDir(defaultProjectName) ? 'toggle' : null),
        message: 'Now Current directory has files. Do you wanting Remove existing files and continue?',
        initial: true,
        active: 'yes',
        inactive: 'no'
    },
    {
        name: 'checkStep',
        type: (prev, values) => {
            const { shouldOverwrite } = values;
            if (shouldOverwrite && !shouldOverwrite) {
                console.log(`  ${(0, kolorist_1.red)('✖ 取消操作')}`);
            }
            return null;
        }
    },
    {
        name: 'pickPresets',
        type: 'select',
        message: '请选择一个预设',
        choices: [
            { title: 'vue ()', value: 'vue' },
            { title: 'react (eslint prettier husky)', value: 'react' }
        ]
    }
];
const initOptions = async () => {
    const result = await (0, prompts_1.default)(options, {
        onCancel: () => {
            console.log(`  ${(0, kolorist_1.red)('✖ 取消操作')}`);
        }
    });
    return { ...result, projectName: defaultProjectName };
};
exports.default = initOptions;
