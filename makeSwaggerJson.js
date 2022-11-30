const fs = require("fs");
const execSync = require("child_process").execSync;
const YAML = require('json-to-pretty-yaml');

var requestBodyJson = {
    "description": "",
    "content": {
        "application/json": {
            "schema": {
                "$ref": "#/components/schemas/input"
            }
        }
    }
}

var responsesJson = {
    "200": {
        "description": "Successful operation",
        "content": {
            "application/json": {
                "schema": {
                    "$ref": "#/components/schemas/output"
                }
            }
        }
    }
}

function recValue(){
    let data = {
        "input": {
            // "required": [],
            "type": "object",
            "properties": {}
        },
        "output": {
            "type": "object",
            "properties": {}
        },
    }

    return data;
}

function recJson(){
    let data = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {

            }
        }
    }
    return data;
}

function swaggerArray() {
    let data = {
        "openapi": "3.0.3",
        "info": {
            "title": "FLOW API",
            "version": "1.0.11"
        },
        "paths": {
        },
        "components": {
            "schemas": {}
        },
        "servers": [
            {
                "url": "https://dualserver.flow.team",
                "variables": {},
                "description": "devServer"
            }
        ]
    }
    return data;
};

function resultExec(command){
    let array = execSync(command).toString().split("\n")
    return array.slice(0,array.length-1);
}

var folderArray = resultExec("find D:/flow-was/src/WEB-INF/src/jex/studio/domain/act -type d -and ! -name '*act'");
var folderObject = {}
for(let i in folderArray){
    try{
        folderObject[folderArray[i]] = resultExec("ls " + folderArray[i] + " | grep -e 'In.java' -e 'Out.java'");
    } catch {
        console.log('passed : ' + folderArray[i]);
    }
}
console.log(JSON.stringify(folderObject, null, 2))

let tmpRecValue;
for (let i in folderArray) {
    try{
        let currentFolderFile = folderObject[folderArray[i]]
        tmpRecValue = recValue();
        let path = "/" + currentFolderFile[0].substring(1, currentFolderFile[0].length - 7) + ".jct";
        let pathRec = {
            [path]: {
                "post": {}
            }
        }
        let tmpSwaagerArray;
        tmpSwaagerArray = swaggerArray();
        tmpSwaagerArray.paths = pathRec;
        for (let j in currentFolderFile) {
            const csv = fs.readFileSync(folderArray[i] + "/" + currentFolderFile[j]);
            const test = csv.toString("utf-8");

            let actionId = test.split('public String get_Id () {');
            let actionName = test.split('public String get_Name() {');
            let actionVersion = test.split('public String get_Version () {');
            let actionCreator = test.split('public String get_Creator () {');
            let actionIdLength = actionId.length - 1;

            actionId = actionId[actionIdLength].substring(12, actionId[actionIdLength].indexOf('";'));
            actionName = actionName[actionIdLength].substring(12, actionName[actionIdLength].indexOf('";'));
            actionVersion = actionVersion[actionIdLength].substring(12, actionVersion[actionIdLength].indexOf('";'));
            actionCreator = actionCreator[actionIdLength].substring(12, actionCreator[actionIdLength].indexOf('";'));

            tmpSwaagerArray.paths[path].post['tags'] = [actionId];
            tmpSwaagerArray.paths[path].post['summary'] = actionName
            tmpSwaagerArray.paths[path].post['description'] = actionName + "\n" + actionCreator + " " + actionVersion;

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

            if (currentFolderFile[j].includes("In.java")) {
                for (let k in jsonArray) {
                    let originParse = JSON.parse(jsonArray[k]);
                    if (originParse.type_imo !== 'RECORD') {
                        // if (originParse.required === 'Y') tmpRecValue.input.required.push(originParse.id)
                        tmpRecValue.input.properties[originParse.id] = {
                            "type": "string",
                            "description": originParse.name
                        }
                    } else {
                        tmpRecValue.input.properties[originParse.id] = makeSwaggerJson(originParse, folderArray[i])
                    }
                }
            } else {
                for (let k in jsonArray) {
                    let originParse = JSON.parse(jsonArray[k]);
                    if (originParse.type_imo !== 'RECORD') {
                        // if (originParse.required === 'Y') tmpRecValue.output.required.push(originParse.id)
                        tmpRecValue.output.properties[originParse.id] = {
                            "type": "string",
                            "description": originParse.name
                        }
                    } else {
                        tmpRecValue.output.properties[originParse.id] = makeSwaggerJson(originParse, folderArray[i])
                    }
                }
            }

        }

        tmpSwaagerArray.paths[path].post['requestBody'] = requestBodyJson;
        tmpSwaagerArray.paths[path].post['responses'] = responsesJson;
        tmpSwaagerArray.components.schemas = tmpRecValue;

        fs.writeFile('./JSON/'+tmpSwaagerArray.paths[path].post['tags'][0]+".json",JSON.stringify(tmpSwaagerArray, null, 2),function(err){
            if (err === null){}
        });
    } catch {
        console.log(folderArray[i])
    }
}

function makeSwaggerJson(recursiveArray,folderPath){

    let tmpRecJson = recJson();

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
            tmpRecJson.items.properties[recursiveArray.id] = {
                "type" : "string",
                "description" : recursiveArray.name
            }
        } else {
            tmpRecJson.items.properties[recursiveArray.id] = makeSwaggerJson(recursiveArray,folderPath);
        }
    }

    return tmpRecJson;
}

// swaggerArray.paths.get['tags'] = 'FLOW_PORTAL_R001';
// swaggerArray.paths.get['summary'] = '포탈 정보 가져오기';
// swaggerArray.paths.get['description'] = '포탈 정보 가져오기';
// swaggerArray.paths.get['operationId'] = '포탈 정보 가져오기';
// swaggerArray.paths.get['requestBody'] = requestBodyJson;
// swaggerArray.paths.get['responses'] = responsesJson;

// console.log(JSON.stringify(swaggerArray,null,2))


