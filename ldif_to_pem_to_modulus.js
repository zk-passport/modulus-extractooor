const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// const inputFilePath = 'icaopkd-001-dsccrl-006901.ldif';
const inputFilePath = 'icaopkd-001-dsccrl-006901.ldif';
const outputDirectory = 'certificates/';

if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
const regex = /userCertificate;binary::\s*([\s\S]*?)(?=\w+:|\n\n|$)/g;
let match;

const certificates = [];
const countryCodes = [];
let counter = 0;

// while ((match = regex.exec(fileContent)) !== null) {
while ((match = regex.exec(fileContent)) !== null && counter < 100) {
  const certificate = match[1].replace(/\s+/g, '');
  certificates.push(certificate);

  // Extract country code a few lines after the found certificate.
  // Assuming maximum of 5000 characters between certificate and country code.
  const countryMatch = /,C=([A-Z]{2})/.exec(fileContent.substring(match.index, match.index + 5000));
  if (countryMatch && countryMatch[1]) {
    const cCode = countryMatch[1];
      countryCodes[counter] = cCode;
  }
  counter++
}

console.log(certificates.length, "certificates found");

for (let i = 0; i < certificates.length; i++) {
  const outputFilePath = path.join(outputDirectory, `certificate_${i}.pem`);
  console.log('outputFilePath', outputFilePath)
  fs.writeFileSync(outputFilePath, `-----BEGIN CERTIFICATE-----\n${certificates[i]}\n-----END CERTIFICATE-----\n`);
}

console.log(`Extracted ${certificates.length} certificates.`);

if (!fs.existsSync('modulus')) {
  fs.mkdirSync('modulus');
}

// Loop through each certificate file and extract the modulus
const numCertificates = certificates.length;  // Replace with the number of certificates you have
const concurrencyLimit = 500;  // Number of tasks to run at once

async function extractModulus(i) {
  try {
    await execAsync(`openssl x509 -in certificates/certificate_${i}.pem -modulus -noout >> all_modulus.txt`);
    console.log(`Extracted modulus_${i}.txt`);
  } catch (error) {
    console.error(`Failed to extract modulus_${i}.txt: ${error}`);
  }
}

(async () => {
  for (let i = 0; i < numCertificates; i += concurrencyLimit) {
    const tasks = [];
    for (let j = 0; j < concurrencyLimit && i + j < numCertificates; j++) {
      tasks.push(extractModulus(i + j + 1));
    }
    await Promise.all(tasks);
  }
  console.log("Finished extracting all modulus");
})();



function parseModulusToJSON(text) {
  // Split text by lines
  const lines = text.split('\n');

  // Initialize empty array to hold modulus data
  const modulusArray = [];

  // Loop through each line to find modulus
  for (const line of lines) {
    if (line.startsWith('Modulus=')) {
      const modulus = line.replace('Modulus=', '');
      modulusArray.push({ modulus });
    }
  }

  // Convert array to JSON
  const jsonOutput = JSON.stringify(modulusArray, null, 2);  // Pretty-printed JSON

  return jsonOutput;
}

const allModulus = fs.readFileSync("all_modulus.txt", 'utf-8');

const jsonOutput = parseModulusToJSON(allModulus);
// console.log(jsonOutput);