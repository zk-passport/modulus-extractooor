const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const numCertificates = 19723; // 19723 // Replace with the number of certificates you have
const concurrencyLimit = 500;  // Number of tasks to run at once

const obj = {}
async function extractModulus(i) {
  try {
    const sigAlgRaw = await execAsync(`openssl x509 -inform PEM -text -in certificates/certificate_${i}.pem | grep '      Signature Algorithm'`);
    const sigAlg = sigAlgRaw.stdout
    const issuerRaw = await execAsync(`openssl x509 -inform PEM -text -in certificates/certificate_${i}.pem | grep 'Issuer:'`);
    const issuer = issuerRaw.stdout
    if (obj[sigAlg]) {
      if (obj[sigAlg][issuer]) {
        obj[sigAlg][issuer] = obj[sigAlg][issuer] + 1
      } else {
        obj[sigAlg][issuer] = 1
      }
    } else {
      obj[sigAlg] = {}
      obj[sigAlg][issuer] = 1
    }
  } catch (error) {
    console.error(`Failed to extract data from certif ${i}: ${error}`);
  }
}

async function main() {
  for (let i = 0; i < numCertificates; i += concurrencyLimit) {
    const tasks = [];
    for (let j = 0; j < concurrencyLimit && i + j < numCertificates; j++) {
      tasks.push(extractModulus(i + j + 1));
    }
    await Promise.all(tasks);
  }
  console.log("Finished scanning");
  console.log(obj)
  fs.writeFileSync("scan.json", obj);
}

main()
