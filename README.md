# json_for_directory

## json schema
This new schema is completely different as it doesn't try to replicate the tree of the file system like before. Instead, now there is a "check" object which contains all the files to be checked for and their respective keywords. With a much simpler schema, I am guessing this would be a lot easier to use and the programme would be less likely to crash. 

## email
The function in this module now takes in an extra object emailCred, meant to store email credentials. Previously it was done with environment varialbes.

## traverse
This module is largley the same as before. 3 lines of code was added to accomodate the way file pahts are resolved on windows.

## UserInput
1. The file path to the json file will be asked for, this is where all ninformation the keywords and files to be looked for will be found. 
2. The second input prompted is the base directory from which to start your search.
3. Alternatively, if keying in the inputs every time the programme is run is a chore, there is also the option of hardcoding the input direcly. Just go to main.js file and remove/comment all the lines prompting the use, and uncomment the traverse function and input the filepath and base directory there.

## Environment variables
There are absolutely no environment variables involved in this repository. All email credentials are shifted to sample.json. Even though I absolutely disagree with this practice.
