const fs = require("fs");
const csv = fs.readFileSync('./config123');
const test = csv.toString("utf-8");

// console.log(test);
//
// fs.writeFile('./config.js',test,function(err){
//     if (err === null){}
// });

let definitions =[
    {
        "name": "ACT_GENERATE_S3_PRESIGNED_URL",
        "url": "./definitions/ACT_GENERATE_S3_PRESIGNED_URL.json"
    }
]

definitions.push(    {
    "name": "ACT_GENERATE_S3_PRESIGNED_URL",
    "url": "./definitions/ACT_GENERATE_S3_PRESIGNED_URL.json"
})

console.log(definitions)
