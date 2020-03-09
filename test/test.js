const { describe, it } = require("mocha");
const { assert } = require("chai");

var path = require('path');
var os = require('os');
var fs = require('fs');
var readline = require('readline');

var isWin = (os.platform() === "win32");

//const ReportMaker = require("../reportmaker");

describe("Output tests", () => {

  if(isWin) {
    describe("Parse Windows Output", function() {

      it('it should scan and parse a folder of files with windows path', function() {

        var filerawdata = fs.readFileSync(path.join("test","windowsreports","shopizer27-output","ApplicationSummary.json"));

        if(filerawdata) {
          assert(true);
        }
        else {
          assert(false);
        }
      });
    });
  }
  else {
    describe("Parse Linux/MacOS Output", function() {

      it('it should scan and parse a folder of files with unix path', function() {


        var filerawdata = fs.readFileSync(path.join("test","linuxmacosreports","shopizer27-output","ApplicationSummary.json"));

        if(filerawdata) {
          assert(true);
        }
        else {
          assert(false);
        }
      });
    });
  }

  var contentoffile = [];

  describe("Parse AbstractController JSON output", function(){
    it('it should parse AbstractController_102 json file and get the file path', function() {
      var filepath = path.join("test","linuxmacosreports","shopizer29-output","resultByFile","AbstractController_102.json");
      console.log(filepath);
      var filerawdata = fs.readFileSync(filepath);

      try {
        contentoffile = JSON.parse(filerawdata);
        assert.equal(contentoffile["file"],"./test/sources/shopizer-2.9.0/sm-shop/src/main/java/com/salesmanager/shop/store/controller/AbstractController.java");
      }
      catch(error) {
        assert(false);
      }
    });
  });

  describe("Read the file AbstractController.java", function(){

    it('it should get the lines of codes from the bookmarks', function() {

      try {
        // we are going to scan the file and keep the bookmarked code
        readInterface = readline.createInterface({
          input: fs.createReadStream(contentoffile["file"]),
          //output: process.stdout,
          console: false
        });

        lineindex = 0;
        readInterface.on('line', function(line) {
          lineindex++;
          console.log(lineindex+":"+line);

        });

        assert(true);
      }
      catch(error) {
        console.log(error);
        assert(false);
      }
      //contentoffile["ViolationList"];

    });
  });
});
