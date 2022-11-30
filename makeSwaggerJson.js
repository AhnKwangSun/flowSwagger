const fs = require("fs");
const execSync = require("child_process").execSync;;
const YAML = require('json-to-pretty-yaml');
var swaggerArray = {
    "openapi":"3.0.3",
    "info": {
        "title": "FLOW API",
        "version": "1.0.11"
    },
    "paths": {
        "post": {

        },
        "get": {

        }
    },
    "servers": [
        {
            "url": "https://dualserver.flow.team",
            "variables": {},
            "description": "devServer"
        }
    ]
};

var folderArray = resultExec("find D:/flow-was/src/WEB-INF/src/jex/studio/domain/act -mtime -1 -type d -and ! -name '*act'");
var folderObject = {}
for(let i in folderArray){
    folderObject[folderArray[i]] = resultExec("ls " + folderArray[i] + " | grep -e 'In.java' -e 'Out.java'");
}

for(let i in folderArray){
    let currentFolderFile = folderObject[folderArray[i]]
    for(let j in currentFolderFile) {
        const csv = fs.readFileSync(folderArray[i] + "/" + currentFolderFile[j]);
        const test = csv.toString("utf-8");

        const actionId = test.split('public String get_Id () {');
        const actionName = test.split('public String get_Name () {');
        const actionVersion = test.split('public String get_Version () {');
        const actionCreator = test.split('public String get_Creator () {');
        const imoJsonParse = test.split('JexDomainUtil.parseIMODataItem(');
        const jsonArray = [];
        const arrayLength = imoJsonParse.length-1;
        imoJsonParse[arrayLength] = imoJsonParse[arrayLength].substring(imoJsonParse[arrayLength].indexOf('};'))

        for(let i in imoJsonParse)
        {
            if(imoJsonParse[i].includes('type_imo')){
                let tmpSubString = imoJsonParse[i].substring(0,imoJsonParse[i].length-6);
                jsonArray.push(JSON.parse(tmpSubString))
            }
        }

        for(let k in jsonArray){
            let originParse = JSON.parse(jsonArray[k]);
            makeSwaggerJson(originParse,folderArray[i])
        }
    }
}

function makeSwaggerJson(recursiveArray,folderPath){
    if(recursiveArray.type_imo === 'RECORD'){
        let javaFileName = recursiveArray.resource
        javaFileName = javaFileName.split('.');
        javaFileName = folderPath + "/" + javaFileName[javaFileName.length-1] + '.java';
        const csv = fs.readFileSync(javaFileName);
        const recordCsv = csv.toString("utf-8");
        const recordCsv2 = recordCsv.split('JexDomainUtil.parseIMODataItem(');
        const recordJsonArray = [];
        const recordArrayLength = recordCsv2.length-1;
        recordCsv2[recordArrayLength] = recordCsv2[recordArrayLength].substring(recordCsv2[recordArrayLength].indexOf('};'))

        for(let i in recordCsv2)
        {
            if(recordCsv2[i].includes('type_imo')){
                recordJsonArray.push(JSON.parse(recordCsv2[i].substring(0,recordCsv2[i].length-6)))
            }
        }

        for(let i in recordJsonArray){
            let recursiveArray = JSON.parse(recordJsonArray[i]);
            console.log(recursiveArray);
            makeSwaggerJson(recursiveArray,folderPath)
        }
    } else {
        console.log(recursiveArray)
    }
}

function resultExec(command){
    let array = execSync(command).toString().split("\n")
    return array.slice(0,array.length-1);
}
