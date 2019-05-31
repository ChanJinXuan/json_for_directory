const fs = require('fs');
const path = require('path');

const sendMail = require('../email/email');
const walk = require("./walk");

const standardMessage = "A policy is in place to notify you of the test results.";

//声明变量
var content = "";
var missingFiles = [];
var keywordsResults = [];
var keywordsMissingResults = [];

//以下是读取json文件
function traverse_with_json(jsonFile, startingDirectory) {
    //声明变量
    var jsonDir = "";
    var strArr = [];

    if (jsonFile.includes("\\")) {
        strArr = jsonFile.split("/");
    } else {
        strArr = jsonFile.split("/");
    }


    for (var i = 0; i < strArr.length - 1; i++) {
        jsonDir += "/" + strArr[i];
    }

    //以下代码允许读取json
    fs.readFile(jsonFile, function (err, data) {
        if (err) {
            throw err;
        }

        content += data;
        var obj = JSON.parse(content);
        console.log(obj);

        //声明变量
        var check = obj["check"];
        var resultsFile = obj["results"];
        var recepients = obj["watchers"];
        var host = obj["host"]; 
        var port = obj["port"]; 
        var senderAddress = obj["senderAddress"]; 
        var username = obj["username"]; 
        var password = obj["password"];
        
        var emailCred = {
            host:host,
            port:port,
            senderAddress:senderAddress,
            username:username,
            password:password,
        };

        walk(startingDirectory, function (err, scanResults) {
            if (err) {
                //end program 停止
                throw err;
            }
            runCheck(check, jsonDir, resultsFile, recepients, scanResults,emailCred);
        });
    });
}

async function runCheck(check, jsonFile, resultsFile, recepients, scanResults,emailCred) {
    for (var oneFile of check) {
        //声明变量
        var relPath = oneFile["relPath"];
        var keywords = oneFile["keywords"];
        var description = oneFile["description"];
        var filename = path.resolve(jsonFile, relPath);
        var foundFileFlag = false;

        for (var result of scanResults) {
            if (!result) {
                //quick fix to skip loop if result is undefined 如果结果未定义，快速修复跳过循环
                //Root cause is in walk, some undefined variable might get added to list 根本原因是在walk中，一些未定义的变量可能会被添加到列表中
                continue;
            }

            //replace forward slash with backslash 用反斜杠替换正斜杠
            var windowsRelPath = relPath.replace(/\//g, '\\');
            //console.log(windowsRelPath);

            if (result.endsWith(relPath) || result.endsWith(windowsRelPath)) {
                //found the file 找到文件后
                foundFileFlag = true;
                await findKeywords(result).then(function (stringIn) {
                    for (var oneKeyword of keywords) {
                        if (stringIn.includes(oneKeyword)) {
                            //  console.log("in" + oneKeyword);
                            keywordsResults.push("("+description+") "+"\"" + oneKeyword + "\"" + " 有在 " + filename);
                        }
                        else {
                            // console.log("missing" + oneKeyword);
                            keywordsMissingResults.push("("+description+") "+"\"" + oneKeyword + "\"" + " 不存在 " + filename);
                        }
                    }
                }).catch(function (err) {
                    //this catch block should not be necessary because only files that can be found are added
                    //to the array by walk.js
                    console.log(err);
                    missingFiles.push("("+description+") "+filename + " is missing. ");
                });
            }
        }
        if (!foundFileFlag) {
            missingFiles.push("("+description+") "+filename + " is missing. ");
        }
    }


    console.log("----------不存在的文件/目录-----------");
    console.log(missingFiles);
    console.log("----------不存在的关键词-----------");
    console.log(keywordsMissingResults);
    console.log("----------关键词-----------");
    console.log(keywordsResults);


    //use \r\n for new lines in Windows
    //以下是来写丢失的文件和错误的关键字
    var resultsString = "--------------不存在的文件/目录--------------\r\n";
    for (var oneFile of missingFiles) {
        resultsString += oneFile + "\r\n";
    }

    resultsString += "\r\n---------------不存在的关键词---------------\r\n";

    for (var oneMissingKeyword of keywordsMissingResults) {
        resultsString += oneMissingKeyword + "\r\n";
    }

    resultsString += "\r\n---------------关键词---------------\r\n";
    for (var oneKeyword of keywordsResults) {
        resultsString += oneKeyword + "\r\n";
    }

    //put a timestamp on the file name 在文件名上加上时间戳
    resultsFile += "_" + Date.now().toString() + ".txt";
    fs.writeFile(resultsFile, resultsString, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("Write to " + resultsFile + " complete. ");
    });

    //clean up resultsFile 清理结果文件
    var emailResultsFile = resultsFile.replace("./", "");
    console.log(emailResultsFile);
    //make attachments array to send over, just one attachment 使附件数组发送，只需一个附件
    var attachments = [
        {
            filename: resultsFile,
            content: resultsString,
        }
    ];

    sendMail(standardMessage, attachments, recepients, emailCred);
}

async function findKeywords(filename) {
    return fs.readFileAsync(filename);
}

fs.readFileAsync = function (filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, function (err, data) {
            if (err)
                reject(err);
            else {

                resolve(data);
            }
        });
    });
};

module.exports = traverse_with_json;
