//console.log('PDF Maker initializating...');

var path = require('path');
var os = require('os');
var readline = require('readline')

var myArgs = process.argv.slice(2);

var input = '';
var output = '';
var report = '';
var format = 'PDF';

var doc;

if ( myArgs.length > 0) {

  for (var i = 0; i < myArgs.length; i++ ) {

    if ( myArgs[i] == '--help' ) {
      displayhelp();
    }

    if ( myArgs[i] == '--input' ) {
      input = myArgs[i+1];

      input = path.normalize(input);

      //console.log("intput="+input);
    }

    if ( myArgs[i] == '--output' ) {
      output = myArgs[i+1];

      output = path.normalize(output);

      //console.log("output="+output);
    }

    if ( myArgs[i] == '--format' ) {
      format = myArgs[i+1];

      //console.log("format="+format);
    }

    if ( myArgs[i] == '--report' ) {
      report = myArgs[i+1];

      //console.log("report="+report);
    }
  }
}
else {
  displayhelp();
}

var template;

try {
  template = require(/*path.join(*/'./templates/'+report+'.template.js');
}
catch(error) {
  console.log("Cannot load the template from report:"+report);
  console.error(error);
  process.exit(1);
}

//console.log(template.templatetitle);

function displayhelp() {

  console.log("CARL Report Maker Help");
  console.log("--input: path to the folder where to find the CARL output");
  console.log("--output: path where the report will be saved");
  console.log("--report: OWASP2017|OWASP2013|CWETop252011|CWETop252019|OWASPMobile2016 (CAST Health Factors if empty)");
  console.log("--format: PDF|HTML (PDF by default)");

  process.exit(1);
}

const fs   = require('fs');
const pdf = require('pdfjs');

// read the application json file
let rawdata = fs.readFileSync(input+'/ApplicationSummary.json');
let applicationSummary;

try {
  applicationSummary = JSON.parse(rawdata);

  console.log(applicationSummary["Application Name"]+' report to be started...');
}
catch(error) {
  console.error(error);
  process.exit(1);
}

// read the results by QRs json file
let byQRsData = [];
let readInterfaces = [];
let readInterfaceIndexes = [];
let readInterfaceFilePaths = [];
let allScannedFiles = [];

let closedInterfaces = 0;


const resultsByFilePath = path.join(input+"/resultByFile")
files = fs.readdirSync(resultsByFilePath);

let allBookmarksByRuleId = {};

files.forEach(function(file) {

  // let scan file by file and regroup the information by rule id for rendering
  //
  // rule id => file => (primary) bookmarks -> associated bookmarks

  try {

    let byFileRawdata = fs.readFileSync(path.join(resultsByFilePath,file));
    let byQRResults = JSON.parse(byFileRawdata);

    var violationList = byQRResults["ViolationList"];
    violationList.forEach((item, i) => {

      var bookmarks = [];

      if(Object.keys(allBookmarksByRuleId).indexOf(item["ViolationId"])!=-1) {
        bookmarks = allBookmarksByRuleId[item["ViolationId"]];
      }
      else {
        allBookmarksByRuleId[item["ViolationId"]] = bookmarks;
      }

      var violations = item["Violations"];
      violations.forEach((violationitem, i) => {
        var violationbookmarks = violationitem["bookmarks"];
        violationbookmarks.forEach((violationbookmark, i) => {

          // bookmark structure
          // lineStart colStart
          // lineEnd colEnd
          bookmarks.push({"file":byQRResults["file"],"bookmark":violationbookmark,"codes":[],"ID":violationitem["ID"]});

          if(allScannedFiles.indexOf(byQRResults["file"])==-1) {
            allScannedFiles.push(byQRResults["file"])
          }
        });

        // manage associated bookmark
        /*var violationbookmarks = violationitem["associated-bookmarks"];
        violationbookmarks.forEach((violationbookmark, i) => {

          // bookmark structure
          // lineStart colStart
          // lineEnd colEnd
          bookmarks.push({"file":violationbookmark["associated-bookmark-file-name"],"bookmark":violationbookmark,"codes":[],"ID":violationitem["ID"]});
        });*/
      });

      //console.log(bookmarks);

    });
  }
  catch(error) {

      console.log("Cannot parse "+file+ " as json...");
      //console.error(error);
      //process.exit(1);
  }
});

allScannedFiles.forEach(function(thefile) {

    //process.exit(1);

    var readInterface;

    try {
      // we are going to scan the file and keep the bookmarked code

      readInterface = readline.createInterface({
        input: fs.createReadStream(thefile),
//        output: process.stdout,
//        console: false
      });

      readInterfaces.push(readInterface);
      readInterfaceIndexes.push(0);
      readInterfaceFilePaths.push(thefile);
    }
    catch(error) {
      console.log(thefile+" cannot be found:"+error);
    }

    //console.log("readInterfaceIndexes:"+readInterfaceIndexes.length);

    //process.exit(1)

    readInterface.on('line', function(line) {

      var interfaceIndex = readInterfaces.indexOf(readInterface);

      var lineindex = readInterfaceIndexes[interfaceIndex];
      lineindex = lineindex+1;
      readInterfaceIndexes[interfaceIndex] = lineindex;
      var filepath = readInterfaceFilePaths[interfaceIndex];

      //console.log("read line "+lineindex+" of "+filepath);

      Object.keys(allBookmarksByRuleId).forEach((ruleid, i) => {

        //console.log("BEFORE:"+allBookmarksByRuleId[ruleid].length);

        allBookmarksByRuleId[ruleid].forEach((bookmarkfile, i) => {

          //console.log(bookmarkfile["file"]);

          if(bookmarkfile["file"]===filepath) {
            var realBookmark = bookmarkfile["bookmark"];
            if((lineindex >= realBookmark["lineStart"]) && (lineindex <= realBookmark["lineEnd"])) {

              bookmarkfile["codes"].push([lineindex,line]);
            }
          }
        });
      });



      /*bookmarks.forEach((bookmark, i) => {

          //console.log("checking bookmark:"+bookmark["bookmark"]["lineStart"]+" VS "+lineindex);

        });*/
    }).on('close', function() {

      closedInterfaces = closedInterfaces+1;

      if(readInterfaces.length == closedInterfaces)
      {
        //console.log(allBookmarksByRuleId);

        console.log("allBookmarks:"+Object.keys(allBookmarksByRuleId).length);

        // start the document here

        setupDocument();

        // generate the output based on the report
        if(report!="") {

          someDescriptions = "";
          try {
            someDescriptions = template.templatedescriptions;
          }
          catch(error) {
            // do nothing
          }

          generateSecurityReport(template.templatetitle,template.templatetags,template.templateheaders,someDescriptions,allBookmarksByRuleId);
        }
        else {
          generateBasicReport();
        }

        finalizeDocument();
      }
    });
});

const stylecss = " \
body { height:100%; font-family: sans-serif, Arial; } \
h1,h2,h3,h4,h5,h6 {margin-top: 20px; margin-bottom: 6px;} \
.nofindings { color: #909090; } \
table { width: 100%; } \
table, th, td { \
  border: 1px solid black; border-collapse: collapse; padding: 4px; align:left; }\
tbody tr:nth-child(even) { \
  background-color: #f5f5f5; } \
tbody tr { \
    font-size: 14px; \
    color: #101010; \
    line-height: 1.2; \
    font-weight: unset; \
code { \
  background-color: #EEF3FB; \
  margin: 8px; }\
}";

const fonts = {
  CourierBold: require('pdfjs/font/Courier-Bold.js'),
  CourierBoldOblique: require('pdfjs/font/Courier-BoldOblique.js'),
  CourierOblique: require('pdfjs/font/Courier-Oblique.js'),
  Courier: require('pdfjs/font/Courier.js'),
  HelveticaBold: require('pdfjs/font/Helvetica-Bold.js'),
  HelveticaBoldOblique: require('pdfjs/font/Helvetica-BoldOblique.js'),
  HelveticaOblique: require('pdfjs/font/Helvetica-Oblique.js'),
  Helvetica: require('pdfjs/font/Helvetica.js'),
  Symbol: require('pdfjs/font/Symbol.js'),
  TimesBold: require('pdfjs/font/Times-Bold.js'),
  TimesBoldItalic: require('pdfjs/font/Times-BoldItalic.js'),
  TimesItalic: require('pdfjs/font/Times-Italic.js'),
  TimesRoman: require('pdfjs/font/Times-Roman.js'),
  ZapfDingbats: require('pdfjs/font/ZapfDingbats.js'),
}

const paddingOptions = { paddingBottom: 0.5*pdf.cm, paddingTop: 0.5*pdf.cm };
const paddingBottomOptions = { paddingBottom: 0.5*pdf.cm };
const codeOptions = {font: fonts.Courier };

const h1 = { fontSize: 18, font: fonts.HelveticaBold };
const h2 = { fontSize: 16, font: fonts.HelveticaBold };
const h3 = { fontSize: 14, font: fonts.HelveticaBold };
const h4 = { fontSize: 12, font: fonts.HelveticaBold };
const paragraphFormat = {fontSize: 11, color: "#AAAAAA"};


function generateSecurityReport(reporttitle, categoriesObjects, headers, descriptions, allBookmarksByRuleId) {

  const isHTML = (format == 'HTML');

  var resultTags = applicationSummary["Classify by tag"];

  if(isHTML) {
    doc.write('<h3>CAST Security Report</h3>');
    doc.write('<h4>'+reporttitle+'</h4>');
    doc.write('<table><tr>');

    headers.forEach((item, i) => {
      doc.write('<th>'+item+'</th>');
    });

    doc.write('</tr>');
  }
  else {
    doc.cell(paddingBottomOptions).text('CAST Security Report',h3);
    doc.cell(paddingBottomOptions).text(reporttitle,h4);

    var widths = [null];
    for(c=1; c<headers.length-1; c++) {
      widths.push(70);
    }
    widths.push(60);

    var table = doc.table({
          widths: widths,
          borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
          padding: 5})

    var tr = table.header({ font: fonts.HelveticaBold, fontSize: 9, borderBottomWidth: 1.5 })

    //tr.cell('Category Name')
    headers.forEach((item, i) => {
      //console.log(item);
      tr.cell(item);
    });
    //tr.cell('# Violations', { textAlign: 'right' })
  }

  // prepare key-value mapping by reviewing all categories

  for(k = 0; k < resultTags.length; k++)
  {
      var tagName = resultTags[k]["Tag Name"];
      var nbViolation = resultTags[k]["Number of violation"];

      for (let [key, value] of Object.entries(categoriesObjects)) {

        if(value["id"]==tagName) {
          value["nbviolation"] =  nbViolation;
        }
      }
  }

  // overall table view of violations per security category
  Object.keys(categoriesObjects).forEach(k => {

    var customs;
    try{
      customs = categoriesObjects[k]["custom"];
    }
    catch(error) {
      // no custom but this is not mandatory
    }

    if(isHTML) {
      if(categoriesObjects[k]["applicable"]=="1") {
        doc.write('<tr><td>'+categoriesObjects[k].name+'</td>');

        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            doc.write('<td bgColor="'+block["backgroundColor"]+'">'+block["title"]+'</td>')
          }
        }

        doc.write('<td with="80" align="right">'+categoriesObjects[k].nbviolation.toString()+'</td></tr>');
      }
      else {
        doc.write('<tr><td class="nofindings">'+categoriesObjects[k].name+'</td>');
        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            doc.write('<td bgColor="'+block["backgroundColor"]+'">'+block["title"]+'</td>')
          }
        }
        doc.write('<td with="80" align="right">N/A</td></tr>');
      }
    }
    else {
      var row = table.row()
      if(categoriesObjects[k]["applicable"]=="1") {
        row.cell(categoriesObjects[k].name);

        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            row.cell(block["title"],{'backgroundColor':block["backgroundColor"]});
          }
        }

        row.cell(categoriesObjects[k].nbviolation.toString(),{textAlign:'right'});
      }
      else {
        row.cell(categoriesObjects[k].name,{color: "#CCCCCC"});

        if(customs)
        {
          var allKeys = Object.keys(customs);
          for(p=0;p<allKeys.length; p++)
          {
            var block = customs[allKeys[p]];
            row.cell(block["title"],{'backgroundColor':block["backgroundColor"]});
          }
        }

        row.cell("N/A",{textAlign:'right',color: "#CCCCCC"});
      }
    }
  });

  if(isHTML) {
    doc.write('</table>');
  }


  // display details per security category
  Object.keys(categoriesObjects).forEach(k => {

    currentRuleIdsWithViolations = [];

    if(isHTML) {
      doc.write('<h4>'+categoriesObjects[k].name+'</h4>');
    }
    else {
      doc.pageBreak();
      doc.cell(paddingOptions).text(categoriesObjects[k].name,h4);
    }

    if(descriptions)
    {
      if(isHTML) {
        doc.write("<p>"+descriptions[k].description+"</p>");
      }
      else {
        doc.cell(paddingOptions).text(descriptions[k].description);
      }
    }

    var theCategoryId = categoriesObjects[k].id;
    var hasFindings = 0;

    for(j = 0; j < resultTags.length; j++) {

          //some findings could be displayed
          if(theCategoryId == resultTags[j]["Tag Name"]) {
            hasFindings = 1
            addDetails(resultTags[j]["Details"]);

            var results = resultTags[j]["Details"];
            results.forEach( (quickresult,index) => {
              currentRuleIdsWithViolations.push(quickresult["Violation Id"])
            });


            console.log(theCategoryId);
            console.log(currentRuleIdsWithViolations.length + " rules" );
            console.log(currentRuleIdsWithViolations );
          }
    }

    if(hasFindings == 0) {

      if(isHTML) {

        doc.write("<p class='nofindings'>No findings</p>");
      }
      else {

        doc.text("No findings",paragraphFormat);
      }
    }
    else {

      //console.log(currentRuleIdsWithViolations);

      currentRuleIdsWithViolations.forEach((ruleid, i) => {

        var alreadyPrinted = 0;


        if(isHTML) {
          doc.write("<p>"+ruleid+" - Details</p>");
        }
        else {
          doc.text(ruleid+" - Details",h4);
        }

        var allQRBookmarks = allBookmarksByRuleId[ruleid];

        //console.log(allQRBookmarks);

        if(allQRBookmarks) {

          allQRBookmarks.forEach((qrBookmark, j) => {

            var bookmark = qrBookmark["bookmark"];
            var allCodes = qrBookmark["codes"];

            if(isHTML) {
              doc.write("<p>");
              doc.write(qrBookmark["file"]+" starts at line: "+bookmark["lineStart"]+"&nbsp;("+bookmark["colStart"]+") and ends at line:&nbsp;"+bookmark["lineEnd"]+"&nbsp;("+bookmark["colEnd"]+")");
              doc.write("</p><code>");

              allCodes.forEach((thecode, i) => {

                var thelineindex = thecode[0];
                var theline = thecode[1];

                if(i==0) {
                  const colStart = parseInt(bookmark["colStart"]);
                  theline = theline.substring(0,colStart)+"!MARK!"+theline.substring(colStart);
                }

                if(i==(allCodes.length-1)) {
                  const colEnd = parseInt(bookmark["colEnd"]);
                  theline = theline.substring(0,6*(i==0)+colEnd)+"!/MARK!"+theline.substring(6*(i==0)+colEnd);
                }

                //console.log("BEFORE:"+theline);

                theline = theline.replace(new RegExp('\t','g'),'    ');
                theline = theline.replace(new RegExp('<','g'),'&lt;');
                theline = theline.replace(new RegExp('>','g'),'&gt;');
                theline = theline.replace(new RegExp('!MARK!','g'),'<mark>');
                theline = theline.replace(new RegExp('!/MARK!','g'),'</mark>');

                //console.log("AFTER:"+theline);

                doc.write("<b>"+thelineindex+"</b>:"+theline);
              });

              doc.write("</code>");
            }
            else {
              doc.text(qrBookmark["file"]+" starts at line: "+bookmark["lineStart"]+" ("+bookmark["colStart"]+") and ends at line: "+bookmark["lineEnd"]+" ("+bookmark["colEnd"]+")",paddingOptions);

              allCodes.forEach((thecode, i) => {

                var thelineindex = thecode[0];
                var theline = thecode[1];
                const colStart = parseInt(bookmark["colStart"]);
                const colEnd = parseInt(bookmark["colEnd"]);

                doc.cell(paddingOptions).text(thelineindex+":"+theline,codeOptions);


                if((i==0) && (i==(allCodes.length-1))) {

                  doc.cell(paddingOptions).text(codeOptions).add(thelineindex+":").add(theline.substring(0,colStart)).add(theline.substring(colStart,colEnd), { color: 0xCC0000 }).add(theline.substring(colEnd));
                }
                else if(i==0) {
                  doc.cell(paddingOptions).text(codeOptions).add(thelineindex+":").add(theline.substring(0,colStart)).add(theline.substring(colStart),{ color: 0xCC0000 });
                }
                else if(i==(allCodes.length-1)) {
                  doc.cell(paddingOptions).text(codeOptions).add(thelineindex+":").add(theline.substring(0,colEnd),{ color: 0xCC0000 }).add(theline.substring(colEnd));
                }

                //console.log("BEFORE:"+theline);

                /*theline = theline.replace(new RegExp('\t','g'),'    ');
                theline = theline.replace(new RegExp('<','g'),'&lt;');
                theline = theline.replace(new RegExp('>','g'),'&gt;');
                theline = theline.replace(new RegExp('!MARK!','g'),'<mark>');
                theline = theline.replace(new RegExp('!/MARK!','g'),'</mark>');*/

                //console.log("AFTER:"+theline);

                //doc.text(thelineindex+":"+theline);
              });
            }
          });
        }
      });
    }
  });
}

function generateBasicReport() {

  const isHTML = (format == 'HTML');

  //var header = doc.header().table({ widths: [null, null], paddingBottom: 1*pdf.cm }).row()
  //header.cell().text({ textAlign: 'left' }).add('Quality Report')

  if(isHTML) {

      doc.write('<h3>Quality Report</h3>');
      doc.write('<h4>By Health Factors</h4>');
  }
  else {
      doc.text('Quality Report',h3);
      doc.text('By Health Factors',h4);
  }


  let rawdata = fs.readFileSync(input+'/categories.json');
  let categoriesOutput;

  try {
      categoriesOutput = JSON.parse(rawdata);

      //console.log("categoriesOutput="+categoriesOutput.length);
  }
  catch(error) {
      console.error(error);
  }

  if(isHTML) {

  doc.write('<table><tr><th>ID</th><th>Category</th><th align="right"># Violations</th></tr>')
}
  else {

  var table = doc.table({
      widths: [50, null, 200],
      borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
      padding: 5
  })

  var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
    tr.cell('ID')
    tr.cell('Category')
    tr.cell('# Violations', { textAlign: 'right' })
}

  for(j=0; j<categoriesOutput.length; j++) {

      //console.log("category="+categoriesOutput[j]["category"]+" with "+categoriesOutput[j]["totalViolations"]+" violations");

      if(isHTML) {
        doc.write('<tr><td width="80">'+categoriesOutput[j]["id"].toString()+'</td>');
        doc.write('<td>'+categoriesOutput[j]["category"]+'</td>');
        doc.write('<td width="140" align="right">'+categoriesOutput[j]["totalViolations"].toString()+'</td></tr>');
      }
      else {
        var row = table.row()
        row.cell(categoriesOutput[j]["id"].toString());
        row.cell(categoriesOutput[j]["category"]);
        row.cell(categoriesOutput[j]["totalViolations"].toString(),{textAlign:'right'});
      }
  }

  if(isHTML) {
    doc.write('</table>');
  }

  for(j=0; j<categoriesOutput.length; j++) {

    var listOfRulesArray = categoriesOutput[j]["listOfRules"];

    if(isHTML) {

      doc.write('<h3>'+categoriesOutput[j]["category"]+" details</h3>")
      doc.write('<table width="100%"><tr><th>ID</th><th>Rule Name</th><th align="right"># Violations</th>')

      for(k=0; k<listOfRulesArray.length; k++)
      {
        doc.write('<tr><td width="80">'+listOfRulesArray[k]["id"].toString()+'</td>');
        doc.write('<td>'+listOfRulesArray[k]["violationName"]+'</td>');
        doc.write('<td width="140" align="right">'+listOfRulesArray[k]["violationCount"].toString()+'</td></tr>');
      }

      doc.write('</table>');
    }
    else {

      doc.pageBreak();

      doc.text(categoriesOutput[j]["category"]+" details",h3)
      var cattable = doc.table({
          widths: [80, null, 200],
          borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
          padding: 5
      })

      var tr = cattable.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
        tr.cell('ID')
        tr.cell('Rule Name')
        tr.cell('# Violations', { textAlign: 'right' })


      for(k=0; k<listOfRulesArray.length; k++)
      {
        var row = cattable.row()
        row.cell(listOfRulesArray[k]["id"].toString());
        row.cell(listOfRulesArray[k]["violationName"]);
        row.cell(listOfRulesArray[k]["violationCount"].toString(),{textAlign:'right'});

      }
    }
    }
}

function addDetails(somedetails) {

  const isHTML = (format == 'HTML');

  if(somedetails.length>0) {

        if(isHTML) {
          doc.write('<table><tr><th>ID</th><th>Name</th><th># Violations</th></tr>')

        }
        else {
          var table = doc.table({
                    widths: [80, null, 200],
                    borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
                    padding: 5
          })

          var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
          tr.cell('ID')
          tr.cell('Name')
          tr.cell('# Violations', { textAlign: 'right' })
        }

          for(detailsj=0; detailsj<somedetails.length; detailsj++) {

            if(isHTML)
            {
              doc.write('<tr><td width="80">'+somedetails[detailsj]["Violation Id"].toString()+'</td>');
              doc.write('<td>'+somedetails[detailsj]["Violation Name"]+'</td>');
              doc.write('<td align="right" width="140">'+somedetails[detailsj]["Number of violation"].toString()+'</td></tr>');

            }
            else {
              var row = table.row()
              row.cell(somedetails[detailsj]["Violation Id"].toString());
              row.cell(somedetails[detailsj]["Violation Name"]);
              row.cell(somedetails[detailsj]["Number of violation"].toString(),{textAlign:'right'});

            }
          }

          if(isHTML) {
            doc.write('</table>');
          }

    }
    else { // no findings

        if(isHTML) {
          doc.write("<p class='nofindings'>No findings</p>");
        }
        else {
          doc.text("No findings",paragraphFormat);
        }
    }
}

function setupDocument() {

  if(format == "PDF") {
    console.log('Report Maker create a new PDF document...');
    doc = new pdf.Document({
      font:    fonts.Helvetica,
      padding: 10
    });

    doc.pipe(fs.createWriteStream(output));

    doc.footer()
       .pageNumber(function(curr, total) { return curr + ' / ' + total }, { textAlign: 'center' })

    // common part
    const logocast = fs.readFileSync('cast.jpg');
    const logoImgCast = new pdf.Image(logocast);

    var cell = doc.cell({ paddingBottom: 0.5*pdf.cm })
    cell.image(logoImgCast, { height: 0.25*pdf.cm , align: 'right'})

    cell.text(applicationSummary["Application Name"], h1)
    //cell.text.br()
    cell.text("Analysis date: "+applicationSummary["Analysis date"])
    cell.text("Number of Files: "+applicationSummary["Total count of Files"])
    cell.text("Number of Rules: "+applicationSummary["Total number of rules"])
  }
  else {
    console.log('Report Maker create HTML document...');

    doc = fs.createWriteStream(output);

    // common part
    doc.write("<html><head><style>"+stylecss+"</style></head></body>");

  /*  const logocast = fs.readFileSync('cast.jpg');
    const logoImgCast = new pdf.Image(logocast);

    var cell = doc.cell({ paddingBottom: 0.5*pdf.cm })
    cell.image(logoImgCast, { height: 0.25*pdf.cm , align: 'right'})*/

    doc.write("<h1>"+applicationSummary["Application Name"]+"</h1>");
    doc.write("<ul><li>Analysis date:&nbsp;"+applicationSummary["Analysis date"]+"</li>");
    doc.write("<li>Number of Files:&nbsp;"+applicationSummary["Total count of Files"]+"</li>");
    doc.write("<li>Number of Rules:&nbsp;"+applicationSummary["Total number of rules"]+"</li></ul>");
  }
}

function finalizeDocument() {

  console.log('Document saved!');

  if(report == 'HTML') {
      doc.write("</body></html>");
  }

  try {
    doc.end();
  }
  catch(error) {
    console.log("Cannot close the document "+error);
    process.exit(1);
  }
}
