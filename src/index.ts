import jsontoxml from 'jsontoxml';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execFile } from 'child_process';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

let files: string[] = [];
let exclusions: string[] = JSON.parse(`${fs.readFileSync('./exclude.json')}`);

const transpileJson = (files: string[]) => {
    return new Promise((resolve, reject) => {
        console.log(chalk.yellow('=> Attempting to transpile JSON to XML...'));

        files.forEach(file => {
            fs.readFile(file, 'utf8', (err, data) => {
                if (err) reject("==> " + err);

                let fileName;

                if (/\//.test(file)) {
                    fileName = /[a-zA-Z_.json]*$/.exec(file);
                } else {
                    fileName = file;
                }

                let textToWrite = `<!--\n    ${fileName} transpiled by borkdoggo69's JSON to XML transpiler.\n\    Do not modify the transpiled XML!\n-->\n${jsontoxml(data)}`;
    
                fs.writeFile(`${file.split('.')[0]}.xml`, textToWrite, err => {
                    if (err) reject("==> " + err);
                });
            });
        })

        resolve("=> JSON transpiled to XML successfully!");
    });
}

const exec = (exe: string) => {
    return new Promise((resolve, reject) => {
        execFile(exe, (err, data) => {
            if (err) reject(chalk.red(`==> ${err}`));
            resolve(data.toString());
        });
    });
}

fs.readdirSync(path.join(__dirname, '../')).forEach(file => {
    if (/^.+\.json$/.test(file)) {
        if (!exclusions.includes(file)) {
            files.push(file);
        }
    }
});

fs.readdirSync(path.join(__dirname, '../resources')).forEach(entity => {
    console.log(entity);
    if (/^(\w)*/.test(entity)) {
        if (!exclusions.includes(entity)) {
            fs.readdirSync(path.join(__dirname, `../resources/${entity}`)).forEach(file => {
                if (/^.+\.json$/.test(file)) {
                    if (!exclusions.includes(file)) {
                        files.push(`resources/${entity}/` + file);
                    }
                }
            });
        }
    }
});

transpileJson(files)
    .then(res => {
        console.log(chalk.yellow(`${res}`));
        console.log(chalk.red('=> Starting server...'));
        console.log();
    })
    .catch(err => {
        console.log(chalk.red(`${err}`));
    });

exec('Server.exe')
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    });