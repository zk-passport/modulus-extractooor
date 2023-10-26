# modulus-extractooor

This script takes a [ICAO DSC & CRL list](https://download.pkd.icao.int/) in ldif format and extracts the public keys that country authorities use to sign passports.

To run:
```
node extract.js
```

The pubkeys are extracted as modulus only because the exponent is always 65537

More info: [ICAO website](https://www.icao.int/Security/FAL/PKD/Pages/icao-master-list.aspx)

```extract.js``` extracts the modulus to all_modulus.json

```scan_certifs.js``` sorts the certificates by country

`scan.json` contains the signature algorithms used by each country authority
