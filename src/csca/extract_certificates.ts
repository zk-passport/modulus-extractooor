import * as fs from 'fs';
import * as path from 'path';

// extract certificates from ldif file
const fileContent = fs.readFileSync("input/icao_download_section/icaopkd-002-complete-000243.ldif", "utf-8");
const regex = /pkdMasterListContent::\s*([\s\S]*?)(?=\w+:|\n\n|$)/g;
let match: RegExpExecArray | null;

const certificates: string[] = [];

while ((match = regex.exec(fileContent)) !== null) {
  const certificate = match[1].replace(/\s+/g, "");
  certificates.push(certificate);
}

if (!fs.existsSync("csca_certificates/")) {
  fs.mkdirSync("csca_certificates/");
}

for (let i = 0; i < certificates.length; i++) {
  fs.writeFileSync(
    path.join("csca_certificates/", `certificate_${i}.pem`),
    `-----BEGIN CERTIFICATE-----\n${certificates[i]}\n-----END CERTIFICATE-----\n`
  );
}

console.log(`Extracted ${certificates.length} certificates.`);
