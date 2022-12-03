// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(
  projectId = 'my-project',
  locationId = 'us-east1',
  keyRingId = 'my-key-ring',
  keyId = 'my-key',
  ciphertext = Buffer.from('...')
) {
  // [START kms_decrypt_symmetric]
  //
  // TODO(developer): Uncomment these variables before running the sample.
  //
  // const projectId = 'my-project';
  // const locationId = 'us-east1';
  // const keyRingId = 'my-key-ring';
  // const keyId = 'my-key';
  // Ciphertext must be either a Buffer object or a base-64 encoded string
  // const ciphertext = Buffer.from('...');

  // Imports the Cloud KMS library
  const {KeyManagementServiceClient} = require('@google-cloud/kms');

  // Instantiates a client
  const client = new KeyManagementServiceClient();

  // Build the key name
  const keyName = client.cryptoKeyPath(projectId, locationId, keyRingId, keyId);

  // Optional, but recommended: compute ciphertext's CRC32C.
  const crc32c = require('fast-crc32c');
  const ciphertextCrc32c = crc32c.calculate(ciphertext);

  async function decryptSymmetric() {
    const [decryptResponse] = await client.decrypt({
      name: keyName,
      ciphertext: ciphertext,
      ciphertextCrc32c: {
        value: ciphertextCrc32c,
      },
    });

    // Optional, but recommended: perform integrity verification on decryptResponse.
    // For more details on ensuring E2E in-transit integrity to and from Cloud KMS visit:
    // https://cloud.google.com/kms/docs/data-integrity-guidelines
    if (
      crc32c.calculate(decryptResponse.plaintext) !==
      Number(decryptResponse.plaintextCrc32c.value)
    ) {
      throw new Error('Decrypt: response corrupted in-transit');
    }

    const plaintext = decryptResponse.plaintext.toString();

    console.log(`Plaintext: ${plaintext}`);
    return plaintext;
  }

  return decryptSymmetric();
  // [END kms_decrypt_symmetric]
}
module.exports.main = main;

/* c8 ignore next 10 */
if (require.main === module) {
  main(...process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
  process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
