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
                    "url": "https://develop.flow.team",
                    "variables": {},
                    "description": "developServer"
                },
                {
                    "url": "https://staging.flow.team",
                    "variables": {},
                    "description": "stagingServer"
                },
                {
                    "url": "https://flowtest.info",
                    "variables": {},
                    "description": "testServer"
                },
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
    var definitionsJson = [];
    for(let i in folderArray){
        try{
            folderObject[folderArray[i]] = resultExec("ls " + folderArray[i] + " | grep -e 'In.java' -e 'Out.java'");
        } catch {
            console.error('Folder ERROR : ' + folderArray[i]);
        }
    }

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

                actionId = actionId[actionIdLength].substring(actionId[actionIdLength].indexOf('"')+1, actionId[actionIdLength].indexOf('";'));
                actionName = actionName[actionIdLength].substring(actionName[actionIdLength].indexOf('"')+1, actionName[actionIdLength].indexOf('";'));
                actionVersion = actionVersion[actionIdLength].substring(actionVersion[actionIdLength].indexOf('"')+1, actionVersion[actionIdLength].indexOf('";'));
                actionCreator = actionCreator[actionIdLength].substring(actionCreator[actionIdLength].indexOf('"')+1, actionCreator[actionIdLength].indexOf('";'));

                tmpSwaagerArray.paths[path].post['tags'] = [actionId];
                tmpSwaagerArray.paths[path].post['summary'] = actionName
                tmpSwaagerArray.paths[path].post['description'] = actionName + "\n" + actionCreator + " " + actionVersion;

                const imoJsonParse = test.split('JexDomainUtil.parseIMODataItem(');
                const jsonArray = [];
                const arrayLength = imoJsonParse.length - 1;
                imoJsonParse[arrayLength] = imoJsonParse[arrayLength].substring(0,imoJsonParse[arrayLength].indexOf('};'))

                for (let i in imoJsonParse) {
                    if (imoJsonParse[i].includes('type_imo')) {
                        let tmpSubString = imoJsonParse[i].substring(0, imoJsonParse[i].lastIndexOf(')'));
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


            definitionsJson.push({
                "name" : tmpSwaagerArray.paths[path].post['tags'][0],
                "url" : "./definitions/" + tmpSwaagerArray.paths[path].post['tags'][0]+".json"
            })

            fs.writeFile('./public/definitions/'+tmpSwaagerArray.paths[path].post['tags'][0]+".json",JSON.stringify(tmpSwaagerArray, null, 2),function(err){
                if (err === null){}
            });
        } catch {
            console.error("Parse ERROR : " , folderArray[i])
        }

        let sidebarConfig = "export const sidebarConfig = { title: \"FLOW API LIST\", extendTheme: { colors: { brand: { \"50\": \"#E6FFFA\", \"100\": \"#B2F5EA\", \"200\": \"#81E6D9\", \"300\": \"#4FD1C5\", \"400\": \"#38B2AC\", \"500\": \"#319795\", \"600\": \"#2C7A7B\", \"700\": \"#285E61\", \"800\": \"#234E52\", \"900\": \"#1D4044\" }, }, }, };"
        let swaggerUI = "export const swaggerUIProps = { queryConfigEnabled: true,}; "
        let definitions = "export const definitions =" + JSON.stringify(definitionsJson, null, 2);

        let writeConfig = sidebarConfig + swaggerUI + definitions

        fs.writeFile('./config.js',writeConfig,function(err){
            if (err === null){}
        });

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
        recordCsv2[recordArrayLength] = recordCsv2[recordArrayLength].substring(0,recordCsv2[recordArrayLength].indexOf('};'))

        for(let i in recordCsv2)
        {
            if(recordCsv2[i].includes('type_imo')){
                recordJsonArray.push(JSON.parse(recordCsv2[i].substring(0,recordCsv2[i].lastIndexOf(')'))))
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
    console.log("finish : " + new Date());
