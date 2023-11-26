# modulus-extractooor

This script takes a [ICAO DSC & CRL list](https://download.pkd.icao.int/) in ldif format and extracts the public keys that country authorities use to sign passports.

Install
```
yarn
```

Extract certificates from ldif file:
```
ts-node src/extract_certificates.ts
```

Extract public keys:
```
ts-node src/extract_pubkeys.ts
```

Visualize the signature algorithms of each countries, run:
```
ts-node src/extract_sig_algs.ts
```

More info: [ICAO website](https://www.icao.int/Security/FAL/PKD/Pages/icao-master-list.aspx)

`publicKeysParsed.json` contains all the public keys

`signature_algorithms.json` contains the signature algorithms used by each country authority
