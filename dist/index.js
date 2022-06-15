#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const execute_1 = __importDefault(require("./execute"));
const initOptions_1 = __importDefault(require("./initOptions"));
const init = async () => {
    const result = await (0, initOptions_1.default)();
    (0, execute_1.default)(result);
};
init();
