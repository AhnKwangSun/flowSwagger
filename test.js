const fs = require("fs");
const execSync = require("child_process").execSync;
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

var requestBodyJson = {
    "description": "포탈 정보 가져오기",
    "content": {
        "application/json": {
            "schema": {
            }
        },
        "application/x-www-form-urlencoded": {
            "schema": {
            }
        }
    },
    "required": true
}

var responsesJson = {
    "200": {
        "description": "Successful operation",
        "content": {
            "application/json": {
                "schema": {
                }
            }
        }
    }
}

var componentsJson = {
    "schemas": {}
}

function recValue(){
    let data = {
        "input": {
            "required": [],
            "type": "object",
            "properties": {}
        },
        "output": {
            "required": [],
            "type": "object",
            "properties": {}
        },
    }

    return data
}

function resultExec(command){
    let array = execSync(command).toString().split("\n")
    return array.slice(0,array.length-1);
}

var folderArray = resultExec("find D:/flow-was/src/WEB-INF/src/jex/studio/domain/act -mtime -6 -type d -and ! -name '*act'");
var folderObject = {}
for(let i in folderArray){
    folderObject[folderArray[i]] = resultExec("ls " + folderArray[i] + " | grep -e 'In.java' -e 'Out.java'");
}

let tepRecValue;
for (let i in folderArray) {
    let currentFolderFile = folderObject[folderArray[i]]
    for (let j in currentFolderFile) {
        componentsJson = {"schemas": {}};
        tepRecValue = recValue();
        const csv = fs.readFileSync(folderArray[i] + "/" + currentFolderFile[j]);
        const test = csv.toString("utf-8");

        const actionId = test.split('public String get_Id () {');
        const actionName = test.split('public String get_Name () {');
        const actionVersion = test.split('public String get_Version () {');
        const actionCreator = test.split('public String get_Creator () {');
        const imoJsonParse = test.split('JexDomainUtil.parseIMODataItem(');
        const jsonArray = [];
        const arrayLength = imoJsonParse.length - 1;
        imoJsonParse[arrayLength] = imoJsonParse[arrayLength].substring(imoJsonParse[arrayLength].indexOf('};'))

        for (let i in imoJsonParse) {
            if (imoJsonParse[i].includes('type_imo')) {
                let tmpSubString = imoJsonParse[i].substring(0, imoJsonParse[i].length - 6);
                jsonArray.push(JSON.parse(tmpSubString))
            }
        }

        for (let k in jsonArray) {
            let originParse = JSON.parse(jsonArray[k]);
            if (originParse.type_imo !== 'RECORD') {
                if (originParse.required === 'Y') tepRecValue.input.required.push(originParse.id)
                tepRecValue.input.properties[originParse.id] = {
                    "type": "string",
                    "description": originParse.name
                }
            } else {
                tepRecValue.input.properties[originParse.id] = makeSwaggerJson(originParse, folderArray[i])
            }
        }
    }
}

function makeSwaggerJson(recursiveArray,folderPath){

    let tmpRecJson = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {

            }
        }
    }

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
            if(recursiveArray.type_imo !== 'RECORD'){
                tmpRecJson.input.properties[recursiveArray.id].items = {
                    "type" : "string",
                    "description" : recursiveArray.name
                }
            } else {
                tmpRecJson.input.properties[recursiveArray.id].items = {
                    "type" : "array",
                    "description" : recursiveArray.name
                }
            }
            tmpRecJson.input.properties[recursiveArray.id] = makeSwaggerJson(recursiveArray,folderPath,javaFileName.includes("In.java"),recursiveArray.type_imo === 'RECORD',currentRecId)
        }

        return
    }
}

swaggerArray.paths.post['tags'] = 'FLOW_PORTAL_R001';
swaggerArray.paths.post['summary'] = '포탈 정보 가져오기';
swaggerArray.paths.post['description'] = '포탈 정보 가져오기';
swaggerArray.paths.post['operationId'] = '포탈 정보 가져오기';
swaggerArray.paths.post['requestBody'] = requestBodyJson;
swaggerArray.paths.post['responses'] = responsesJson;

swaggerArray.paths.get['tags'] = 'FLOW_PORTAL_R001';
swaggerArray.paths.get['summary'] = '포탈 정보 가져오기';
swaggerArray.paths.get['description'] = '포탈 정보 가져오기';
swaggerArray.paths.get['operationId'] = '포탈 정보 가져오기';
swaggerArray.paths.get['requestBody'] = requestBodyJson;
swaggerArray.paths.get['responses'] = responsesJson;

console.log(JSON.stringify(swaggerArray,null,2))


