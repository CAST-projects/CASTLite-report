let templatetitle = 'OWASP 2016 Mobile Summary Report';
let templateheaders = ["Category Name"/*,"Exploitability","Weakness Prevalence","Weakness Detectability","Technical Impact"*/,"Issues Found"];
let templatetags = [
      {"id":"M1-2016","name":"M1 2016 - Improper Platform Usage ","nbviolation":"0","applicable":"1"},
      {"id":"M2-2016","name":"M2 2016 - Insecure Data Storage","nbviolation":"0","applicable":"1"},
      {"id":"M3-2016","name":"M3 2016 - Insecure Communication","nbviolation":"0","applicable":"1"},
      {"id":"M4-2016","name":"M4 2016 - Insecure Authentication","nbviolation":"0","applicable":"1"},
      {"id":"M5-2016","name":"M5 2016 - Insufficient Cryptography","nbviolation":"0","applicable":"1"},
      {"id":"M6-2016","name":"M6 2016 - Insecure Authorization","nbviolation":"0","applicable":"1"},
      {"id":"M7-2016","name":"M7 2016 - Client Code Quality","nbviolation":"0","applicable":"1"},
      {"id":"M8-2016","name":"M8 2016 - Code Tampering","nbviolation":"0","applicable":"0"},
      {"id":"M9-2016","name":"M9 2016 - Reverse Engineering","nbviolation":"0","applicable":"0"},
      {"id":"M10-2016","name":"M10 2016 - Extraneous Functionality","nbviolation":"0","applicable":"0"}];

let templatedescriptions = [
  {"id":"M1-2016","description":"This category covers misuse of a platform feature or failure to use platform security controls. It might include Android intents, platform permissions, misuse of TouchID, the Keychain, or some other security control that is part of the mobile operating system. There are several ways that mobile apps can experience this risk."},
  {"id":"M2-2016","description":"This covers insecure data storage and unintended data leakage."},
  {"id":"M3-2016","description":"This covers poor handshaking, incorrect SSL versions, weak negotiation, cleartext communication of sensitive assets, etc."},
  {"id":"M4-2016","description":"This category captures notions of authenticating the end user or bad session management. This can include: failing to identify the user at all when that should be required, failure to maintain the user's identity when it is required, weaknesses in session management"},
  {"id":"M5-2016","description":"The code applies cryptography to a sensitive information asset. However, the cryptography is insufficient in some way. Note that anything and everything related to TLS or SSL goes in M3. Also, if the app fails to use cryptography at all when it should, that probably belongs in M2. This category is for issues where cryptography was attempted, but it wasn't done correctly."},
  {"id":"M6-2016","description":"This is a category to capture any failures in authorization (e.g., authorization decisions in the client side, forced browsing, etc.). It is distinct from authentication issues (e.g., device enrolment, user identification, etc.). If the app does not authenticate users at all in a situation where it should (e.g., granting anonymous access to some resource or service when authenticated and authorized access is required), then that is an authentication failure not an authorization failure."},
  {"id":"M7-2016","description":"This was the \"Security Decisions Via Untrusted Inputs\", one of our lesser-used categories. This would be the catch-all for code-level implementation problems in the mobile client. That's distinct from server-side coding mistakes. This would capture things like buffer overflows, format string vulnerabilities, and various other code-level mistakes where the solution is to rewrite some code that's running on the mobile device."},
  {"id":"M8-2016","description":"Insecure deserialization often leads to remote code execution. Even if deserialization flaws do not result in remote code execution, they can be used to perform attacks, including replay attacks, injection attacks, and privilege escalation attacks."},
  {"id":"M9-2016","description":"This category includes analysis of the final core binary to determine its source code, libraries, algorithms, and other assets. Software such as IDA Pro, Hopper, otool, and other binary inspection tools give the attacker insight into the inner workings of the application. This may be used to exploit other nascent vulnerabilities in the application, as well as revealing information about back end servers, cryptographic constants and ciphers, and intellectual property."},
  {"id":"M10-2016","description":"Often, developers include hidden backdoor functionality or other internal development security controls that are not intended to be released into a production environment. For example, a developer may accidentally include a password as a comment in a hybrid app. Another example includes disabling of 2-factor authentication during testing."},

];

module.exports = {templatetitle: templatetitle, templateheaders: templateheaders, templatetags:templatetags, templatedescriptions:templatedescriptions}
