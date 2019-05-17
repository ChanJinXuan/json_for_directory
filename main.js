const traverse = require("./traverse/traverse");
const readline = require('readline');

//first input is json file path 第一个输入是json文件路径
//next input is base directory 下一个输入是基目录


/*traverse("/home/developer/json_for_directory/sample.json",process.env.HOME);
  可以直接投入json的目录*/

//alternatively, prompt for user input on CLI  在CommandLine上提示用户输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Input json file path ', (jsonFile) => {

    rl.question('Now the base directory to start search. ',(baseDir)=>{
        traverse(jsonFile,baseDir);
        rl.close();
    });

});
