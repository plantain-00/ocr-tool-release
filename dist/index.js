"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tesseract_js_1 = require("tesseract.js");
const express_1 = tslib_1.__importDefault(require("express"));
const minimist_1 = tslib_1.__importDefault(require("minimist"));
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const path = tslib_1.__importStar(require("path"));
const tmp = tslib_1.__importStar(require("tmp"));
const fs = tslib_1.__importStar(require("fs"));
const app = express_1.default();
const argv = minimist_1.default(process.argv.slice(2));
const port = argv.p || 9444;
const host = argv.h || 'localhost';
app.use(express_1.default.static(path.resolve(__dirname, '../static')));
app.use(body_parser_1.default.json());
const worker = new tesseract_js_1.TesseractWorker();
app.post('/recognize', (req, res) => {
    const body = req.body;
    const image = body.image;
    const languages = body.languages;
    let lang;
    if (typeof languages === 'string') {
        lang = languages;
    }
    else if (Array.isArray(languages)) {
        lang = languages.join('+');
    }
    const file = tmp.tmpNameSync();
    fs.writeFileSync(file, image.split(',')[1], { encoding: 'base64' });
    worker.recognize(file, lang || 'eng')
        .progress(message => console.log(message))
        .then(result => {
        res.json({ text: result.text });
    })
        .catch((error) => {
        res.json({ error: error.message });
    })
        .finally(() => {
        tmp.setGracefulCleanup();
    });
});
app.listen(port, host, () => {
    console.log(`ocr tool is listening: ${host}:${port}`);
});
process.on('SIGINT', () => {
    process.exit();
});
process.on('SIGTERM', () => {
    process.exit();
});
