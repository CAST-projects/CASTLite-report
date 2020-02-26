let templatetitle = 'CWE Top25 2011 Summary Report';
let templateheaders = ["Category Name","Issues Found"];
let templatetags = [
      {"id":"CWE-89","name":"CWE-89 - Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')","nbviolation":"0","applicable":"1"},
      {"id":"CWE-78","name":"CWE-78 - Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')","nbviolation":"0","applicable":"1"},
      {"id":"CWE-120","name":"CWE-120 - Buffer Copy without Checking Size of Input ('Classic Buffer Overflow')","nbviolation":"0","applicable":"1"},
      {"id":"CWE-79","name":"CWE-79 - Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')","nbviolation":"0","applicable":"1"},
      {"id":"CWE-306","name":"CWE-306 - Missing Authentication for Critical Function","nbviolation":"0","applicable":"1"},
      {"id":"CWE-862","name":"CWE-862 - Missing Authorization","nbviolation":"0","applicable":"1"},
      {"id":"CWE-798","name":"CWE-798 - Use of Hard-coded Credentials","nbviolation":"0","applicable":"1"},
      {"id":"CWE-311","name":"CWE-311 - Missing Encryption of Sensitive Data","nbviolation":"0","applicable":"1"},
      {"id":"CWE-434","name":"CWE-434 - Unrestricted Upload of File with Dangerous Type","nbviolation":"0","applicable":"1"},
      {"id":"CWE-807","name":"CWE-807 - Reliance on Untrusted Inputs in a Security Decision","nbviolation":"0","applicable":"1"},
      {"id":"CWE-250","name":"CWE-250 - Execution with Unnecessary Privileges","nbviolation":"0","applicable":"1"},
      {"id":"CWE-352","name":"CWE-352 - Cross-Site Request Forgery (CSRF)","nbviolation":"0","applicable":"1"},
      {"id":"CWE-22","name":"CWE-22 - Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')","nbviolation":"0","applicable":"1"},
      {"id":"CWE-494","name":"CWE-494 - Download of Code Without Integrity Check","nbviolation":"0","applicable":"1"},
      {"id":"CWE-863","name":"CWE-863 - Incorrect Authorization","nbviolation":"0","applicable":"1"},
      {"id":"CWE-829","name":"CWE-829 - Inclusion of Functionality from Untrusted Control Sphere","nbviolation":"0","applicable":"1"},
      {"id":"CWE-732","name":"CWE-732 - Incorrect Permission Assignment for Critical Resource","nbviolation":"0","applicable":"1"},
      {"id":"CWE-676","name":"CWE-676 - Use of Potentially Dangerous Function","nbviolation":"0","applicable":"1"},
      {"id":"CWE-327","name":"CWE-327 - Use of a Broken or Risky Cryptographic Algorithm","nbviolation":"0","applicable":"1"},
      {"id":"CWE-131","name":"CWE-131 - Incorrect Calculation of Buffer Size","nbviolation":"0","applicable":"1"},
      {"id":"CWE-307","name":"CWE-307 - Improper Restriction of Excessive Authentication Attempts","nbviolation":"0","applicable":"1"},
      {"id":"CWE-601","name":"CWE-601 - URL Redirection to Untrusted Site ('Open Redirect')","nbviolation":"0","applicable":"1"},
      {"id":"CWE-134","name":"CWE-134 - Uncontrolled Format String","nbviolation":"0","applicable":"1"},
      {"id":"CWE-190","name":"CWE-190 - Integer Overflow or Wraparound","nbviolation":"0","applicable":"1"},
      {"id":"CWE-759","name":"CWE-759 - Use of a One-Way Hash without a Salt","nbviolation":"0","applicable":"1"},
    ];

module.exports = {templatetitle: templatetitle, templatetags:templatetags, templateheaders:templateheaders}
