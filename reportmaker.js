//console.log('PDF Maker initializating...');

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

      console.log("intput="+input);
    }

    if ( myArgs[i] == '--output' ) {
      output = myArgs[i+1];

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

function displayhelp() {

  console.log("Report Maker Help");
  console.log("--input: path to the folder where to find the CAST Lite output");
  console.log("--output: path where the report will be saved");
  console.log("--report: OWASP2017|OWASP2013 (CAST Health Factors if empty)");
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


function generateOWASPReport(reporttitle, categoriesObjects) {

    doc.cell(paddingBottomOptions).text('CAST Security Report',h3);
    doc.cell(paddingBottomOptions).text(reporttitle,h4);

    var resultTags = applicationSummary["Classify by tag"];

    var table = doc.table({
            widths: [null, 200],
            borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
            padding: 5
                          })

    var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
    tr.cell('Category Name')
    tr.cell('# Violations', { textAlign: 'right' })

    // prepare key-value mapping

  // Overall categories review

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

  //for(m = 0; m < categoriesObjects.length; m++) {
  // overall table view of violations per owasp category
  Object.keys(categoriesObjects).forEach(k => {

    var row = table.row()
    if(categoriesObjects[k]["applicable"]=="1") {
      row.cell(categoriesObjects[k].name);
      row.cell(categoriesObjects[k].nbviolation.toString(),{textAlign:'right'});
    }
    else {
      row.cell(categoriesObjects[k].name,{color: "#CCCCCC"});
      row.cell("N/A",{textAlign:'right',color: "#CCCCCC"});
    }
  });

  // display details per owasp category
  Object.keys(categoriesObjects).forEach(k => {

    doc.pageBreak();
    doc.cell(paddingOptions).text(categoriesObjects[k].name,h4);
    var theCategoryId = categoriesObjects[k].id;

    //console.log(theCategoryId);

    var hasFindings = 0;

    for(j = 0; j < resultTags.length; j++) {

      //some findings could be displayed
      if(theCategoryId == resultTags[j]["Tag Name"]) {
        hasFindings = 1
        addDetails(resultTags[j]["Details"]);
      }
    }

    if(hasFindings == 0) {
      doc.text("No findings",paragraphFormat);
    }

    });
}

function generateBasicReport() {

  //var header = doc.header().table({ widths: [null, null], paddingBottom: 1*pdf.cm }).row()
  //header.cell().text({ textAlign: 'left' }).add('Quality Report')

  doc.text('Quality Report',h3);
  doc.text('By Health Factors',h4);


  let rawdata = fs.readFileSync(input+'/categories.json');
  let categoriesOutput;

  try {
      categoriesOutput = JSON.parse(rawdata);

      console.log("categoriesOutput="+categoriesOutput.length);
  }
  catch(error) {
      console.error(error);
  }

  var table = doc.table({
      widths: [50, null, 200],
      borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
      padding: 5
  })

  var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
    tr.cell('ID')
    tr.cell('Category')
    tr.cell('# Violations', { textAlign: 'right' })

  for(j=0; j<categoriesOutput.length; j++) {

      //console.log("category="+categoriesOutput[j]["category"]+" with "+categoriesOutput[j]["totalViolations"]+" violations");

      var row = table.row()
      row.cell(categoriesOutput[j]["id"].toString());
      row.cell(categoriesOutput[j]["category"]);

      if(categoriesOutput[j]["applicable"]=="1") {
        row.cell(categoriesOutput[j]["totalViolations"].toString(),{textAlign:'right'});
      }
      else {
        row.cell("N/A",{textAlign:'center'});
      }
  }


  for(j=0; j<categoriesOutput.length; j++) {

    doc.pageBreak();

    doc.text(categoriesOutput[j]["category"]+" details",h3)

    var listOfRulesArray = categoriesOutput[j]["listOfRules"];


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

function addDetails(somedetails) {

  if(somedetails.length>0) {

    var table = doc.table({
              widths: [80, null, 200],
              borderHorizontalWidths: function(i) { return i < 2 ? 1 : 0.1 },
              padding: 5
    })

    var tr = table.header({ font: fonts.HelveticaBold, borderBottomWidth: 1.5 })
    tr.cell('ID')
    tr.cell('Name')
    tr.cell('# Violations', { textAlign: 'right' })

    for(detailsj=0; detailsj<somedetails.length; detailsj++) {

      var row = table.row()
      row.cell(somedetails[detailsj]["Violation Id"].toString());
      row.cell(somedetails[detailsj]["Violation Name"]);
      row.cell(somedetails[detailsj]["Number of violation"].toString(),{textAlign:'right'});
    }
  }
  else { // no findings

    doc.text("No findings",paragraphFormat);
  }
}

// start the document here

var doc;

if(format == "PDF") {
  console.log('Report Maker create PDF document...');
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

  if(report=="OWASP2017")
  {
    generateOWASPReport('OWASP 2017 Summary Report',[
        {"id":"A1-2017","name":"A1 2017 - Injection","nbviolation":"0","applicable":"1"},
        {"id":"A2-2017","name":"A2 2017 - Broken Authentication","nbviolation":"0","applicable":"1"},
        {"id":"A3-2017","name":"A3 2017 - Sensitive Data Exposure","nbviolation":"0","applicable":"1"},
        {"id":"A4-2017","name":"A4 2017 - XML External Entities (XXE)","nbviolation":"0","applicable":"1"},
        {"id":"A5-2017","name":"A5 2017 - Broken Access Control","nbviolation":"0","applicable":"1"},
        {"id":"A6-2017","name":"A6 2017 - Security Misconfiguration","nbviolation":"0","applicable":"1"},
        {"id":"A7-2017","name":"A7 2017 - Cross-Site Scripting (XSS)","nbviolation":"0","applicable":"1"},
        {"id":"A8-2017","name":"A8 2017 - Insecure Deserialization","nbviolation":"0","applicable":"1"},
        {"id":"A9-2017","name":"A9 2017 - Using Components With Known Vulnerabilities","nbviolation":"0","applicable":"1"},
        {"id":"A10-2017","name":"A10 2017 - Insufficient Logging & Monitoring","nbviolation":"0","applicable":"0"}]);
  }
  else if(report=="OWASP2013")
  {
        generateOWASPReport('OWASP 2013 Summary Report',[
        {"id":"A1-2013","name":"A1 2013 - Injection","nbviolation":"0","applicable":"1"},
        {"id":"A2-2013","name":"A2 2013 - Broken Authentication and Session Management","nbviolation":"0","applicable":"1"},
        {"id":"A3-2013","name":"A3 2013 - Cross-Site Scripting (XSS)","nbviolation":"0","applicable":"1"},
        {"id":"A4-2013","name":"A4 2013 - Insecure Direct Object References","nbviolation":"0","applicable":"1"},
        {"id":"A5-2013","name":"A5 2013 - Security Misconfiguration","nbviolation":"0","applicable":"1"},
        {"id":"A6-2013","name":"A6 2013 - Sensitive Data Exposure","nbviolation":"0","applicable":"1"},
        {"id":"A7-2013","name":"A7 2013 - Missing Function Level Access Control","nbviolation":"0","applicable":"1"},
        {"id":"A8-2013","name":"A8 2013 - Cross-Site Request Forgery (CSRF)","nbviolation":"0","applicable":"1"},
        {"id":"A9-2013","name":"A9 2013 - Using Components With Known Vulnerabilities","nbviolation":"0","applicable":"1"},
        {"id":"A10-2013","name":"A10 2013 - Unvalidated Redirects and Forwards","nbviolation":"0","applicable":"1"}]);
  }
  else {
    generateBasicReport();
  }

  console.log('Document saved!');

  doc.end();
}
else if(format == "HTML") {

  doc = fs.createWriteStream(output);

  doc.once('open', function(fd) {
  doc.write("My first row\n");
  doc.write("My second row\n");
  doc.end();
});
}
