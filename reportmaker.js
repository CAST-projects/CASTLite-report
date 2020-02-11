//console.log('PDF Maker initializating...');

var path = require('path');
var os = require('os');

var myArgs = process.argv.slice(2);

var input = '';
var output = '';
var report = '';
var format = 'PDF';

if ( myArgs.length > 0) {

  for (var i = 0; i < myArgs.length; i++ ) {

    if ( myArgs[i] == '--help' ) {
      displayhelp();
    }

    if ( myArgs[i] == '--input' ) {
      input = myArgs[i+1];

      input = path.normalize(input);

      console.log("intput="+input);
    }

    if ( myArgs[i] == '--output' ) {
      output = myArgs[i+1];

      output = path.normalize(output);

      console.log("output="+output);
    }

    if ( myArgs[i] == '--format' ) {
      format = myArgs[i+1];

      console.log("format="+format);
    }

    if ( myArgs[i] == '--report' ) {
      report = myArgs[i+1];

      console.log("report="+report);
    }
  }
}
else {
  displayhelp();
}

var template;

try {
  template = require(/*path.join(*/'./'+report+'.template.js');
}
catch(error) {
  console.log("Cannot load the template from report:"+report);
  console.error(error);
  process.exit(1);
}

console.log(template.templatetitle);

function displayhelp() {

  console.log("Report Maker Help");
  console.log("--input: path to the folder where to find the CAST Lite output");
  console.log("--output: path where the report will be saved");
  console.log("--report: OWASP2017|OWASP2013|CWETop252011|CWETop252019 (CAST Health Factors if empty)");
  console.log("--format: PDF|HTML (PDF by default)");

  process.exit(1);
}

const fs   = require('fs');
const pdf = require('pdfjs');

// read the json file
let rawdata = fs.readFileSync(input+'/ApplicationSummary.json');
let applicationSummary;

try {
  applicationSummary = JSON.parse(rawdata);

  console.log(applicationSummary["Application Name"]+' report');
}
catch(error) {
  console.error(error);
  process.exit(1);
}

const stylecss = " \
body { height:100%; font-family: sans-serif, Arial; } \
h1,h2,h3,h4,h5,h6 {margin: 0px;} \
table, th, td { \
  border: 1px solid black; }\
tbody tr:nth-child(even) { \
  background-color: #f5f5f5; } \
tbody tr { \
    font-size: 14px; \
    color: #808080; \
    line-height: 1.2; \
    font-weight: unset; \
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

const h1 = { fontSize: 18, font: fonts.HelveticaBold };
const h2 = { fontSize: 16, font: fonts.HelveticaBold };
const h3 = { fontSize: 14, font: fonts.HelveticaBold };
const h4 = { fontSize: 12, font: fonts.HelveticaBold };
const paragraphFormat = {fontSize: 11, color: "#AAAAAA"};


function generateSecurityReport(reporttitle, categoriesObjects) {

  const isHTML = (format == 'HTML');

  var resultTags = applicationSummary["Classify by tag"];

  if(isHTML) {
    doc.write('<h3>CAST Security Report</h3>');
    doc.write('<h4>'+reporttitle+'</h4>');

    doc.write('<table><tr><th>Category Name</th><th># Violations</th></tr>');
  }
  else {
    doc.cell(paddingBottomOptions).text('CAST Security Report',h3);
    doc.cell(paddingBottomOptions).text(reporttitle,h4);

    var table = doc.table({
          widths: [null, 200],
          borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
          padding: 5})

    var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
    tr.cell('Category Name')
    tr.cell('# Violations', { textAlign: 'right' })
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

    if(isHTML) {
      if(categoriesObjects[k]["applicable"]=="1") {
        doc.write('<tr><td>'+categoriesObjects[k].name+'</td>');
        doc.write('<td align="right">'+categoriesObjects[k].nbviolation.toString()+'</td></tr>');
      }
      else {
        doc.write('<tr><td class="nofindings">'+categoriesObjects[k].name+'</td>');
        doc.write('<td align="right">N/A</td></tr>');
      }
    }
    else {
      var row = table.row()
      if(categoriesObjects[k]["applicable"]=="1") {
        row.cell(categoriesObjects[k].name);
        row.cell(categoriesObjects[k].nbviolation.toString(),{textAlign:'right'});
      }
      else {
        row.cell(categoriesObjects[k].name,{color: "#CCCCCC"});
        row.cell("N/A",{textAlign:'right',color: "#CCCCCC"});
      }
    }
  });

  if(isHTML) {
    doc.write('</table>');
  }

  // display details per security category
  Object.keys(categoriesObjects).forEach(k => {

    if(isHTML) {
      doc.write('<h4>'+categoriesObjects[k].name+'</h4>');
    }
    else {
      doc.pageBreak();
      doc.cell(paddingOptions).text(categoriesObjects[k].name,h4);
    }

    var theCategoryId = categoriesObjects[k].id;
    var hasFindings = 0;

    for(j = 0; j < resultTags.length; j++) {

          //some findings could be displayed
          if(theCategoryId == resultTags[j]["Tag Name"]) {
            hasFindings = 1
            addDetails(resultTags[j]["Details"]);
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

      console.log("categoriesOutput="+categoriesOutput.length);
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
        doc.write('<tr><td>'+categoriesOutput[j]["id"].toString()+'</td>');
        doc.write('<td>'+categoriesOutput[j]["category"]+'</td>');
        doc.write('<td align="right">'+categoriesOutput[j]["totalViolations"].toString()+'</td></tr>');
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
        doc.write('<tr><td>'+listOfRulesArray[k]["id"].toString()+'</td>');
        doc.write('<td>'+listOfRulesArray[k]["violationName"]+'</td>');
        doc.write('<td align="right">'+listOfRulesArray[k]["violationCount"].toString()+'</td></tr>');
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
              doc.write('<tr><td>'+somedetails[detailsj]["Violation Id"].toString()+'</td>');
              doc.write('<td>'+somedetails[detailsj]["Violation Name"]+'</td>');
              doc.write('<td align="right">'+somedetails[detailsj]["Number of violation"].toString()+'</td></tr>');

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
    doc.write("<p>Analysis date:&nbsp;"+applicationSummary["Analysis date"]+"</p>");
    doc.write("<p>Number of Files:&nbsp;"+applicationSummary["Total count of Files"]+"</p>");
    doc.write("<p>Number of Rules:&nbsp;"+applicationSummary["Analysis date"]+"</p>");
  }
}

function finalizeDocument() {

  console.log('Document saved!');

  if(report == 'HTML') {
      doc.write("</body></html>");
  }

  doc.end();
}

// start the document here

var doc;

setupDocument();

// generate the output based on the report
if(report!="") {
  generateSecurityReport(template.templatetitle,template.templatetags);
}
else {
  generateBasicReport();
}

finalizeDocument();
