

let request = require("request");
let fs = require('fs');
let cheerio = require('cheerio');
const {jsPDF} = require("jspdf");

let $;
let data = {};



request("https://github.com/topics", function (err, res, body){
    if(!err){
        $ = cheerio.load(body);
        
        let abc = $(".no-underline.d-flex.flex-column.flex-justify-center");
        let name = $(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");

        for(let i = 0;i<name.length;i++){
            
            fs.mkdirSync($(name[i]).text().trim());
            getAllProjects("https://github.com/"+$(abc[i]).attr("href"),$(name[i]).text().trim());
        }
    }
});
function getAllProjects(url, name){
    request(url, function(err, res,body){
        $ = cheerio.load(body);
        let allProject = $(".f3.color-text-secondary.text-normal.lh-condensed .text-bold");
        
            if(allProject.length > 8){
                allProject = allProject.slice(0,8);
            }
            for(let i = 0;i<allProject.length;i++){
                let projectUrl = "https://github.com"+$(allProject[i]).attr("href");
                let projectName = $(allProject[i]).text().trim();
                // console.log(projectUrl);
                // console.log(projectName);

                if(!data[name]){
                    data[name] = [{ projectName, projectUrl }];
                }else{
                    data[name].push({ projectName, projectUrl });
                }
                getIssues(projectUrl, projectName,name);

            }
    });
}
function getIssues(url, projectName, topicName){
    request(url+"/issues", function (err, res, body){
    $ = cheerio.load(body);
    let allIssues = $(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
    for(let i = 0;i<allIssues.length;i++){
        let IssueTitle = $(allIssues[i]).text().trim();
        let IssueUrl = "https://github.com"+$(allIssues[i]).attr("href");

        let indx = data[topicName].findIndex(function(e){
            return e.projectName == projectName;
        });

        if(!data[topicName][indx].issues){
            data[topicName][indx].issues = [{IssueTitle, IssueUrl}];
        }else{
            data[topicName][indx].issues.push({IssueTitle, IssueUrl});
        }
        // fs.writeFileSync("data.json", JSON.stringify(data));
        pdfGenerator();
    }
    });
}

function pdfGenerator(){
    for(x in data){
        let tArr = data[x];
        for(y in tArr){
            let pName = tArr[y].projectName;
            if(fs.existsSync(`${x}/${pName}.pdf`))
            fs.unlinkSync(`${x}/${pName}.pdf`);
            const doc = new jsPDF();
            for(z in tArr[y].issues){
                doc.text(tArr[y].issues[z].IssueTitle, 10, 10+15*z);
                doc.text(tArr[y].issues[z].IssueUrl, 10, 15+15*z);
            }
            doc.save(`${x}/${pName}.pdf`);
        }
    }
}
    

