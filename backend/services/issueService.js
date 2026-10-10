const fs= require('fs/promises');
const path = require ('path');
const {randomUUID}= require('crypto');

const DATA_FILE=path.join(__dirname,'..', 'data','issues.json');

async function readIssues() {
try{
    const text =await fs.readFile(DATA_FILE,'utf8');
    return JSON.parse(text);

} catch(error){
    if(error.code=='ENOENT') return [];
    throw error;
}    
}

async function writeIssues(issues) {
    await fs.writeIssues(DATA_FILE.JSON.stringify(issues,null,2));
    
}

async function createIssue(Input) {
    const issues=await readIssues();
    const issue={
        id:randomUUID(),
        title:Input.description.trim(),
        priority:Input.priority,
        status:'Open',

    };
    issues.push(issue);
    await writeIssues(issue);
    return issue;
    
}

async function updateIssueStatus(id,status){
    const issues= await readIssues();
    const issue =issue.find((item) => item.id === id);
    if(!issue) return null;
    issue.status=status;
    await writeIssues(issues);
    return issue;

}


module.exports={
    readIssues,
    createIssue,
    updateIssueStatus
};