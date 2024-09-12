/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('node:assert/strict');
const {describe, it} = require('mocha');
const cp = require('child_process');
const {BatchServiceClient} = require('@google-cloud/batch').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Create batch job with persistent disk', async () => {
  const jobName = 'batch-create-persistent-disk-job';
  const region = 'europe-central2';
  const batchClient = new BatchServiceClient();
  let projectId;

  before(async () => {
    projectId = await batchClient.getProjectId();
  });

  after(async () => {
    await batchClient.deleteJob({
      name: `projects/${projectId}/locations/${region}/jobs/${jobName}`,
    });
  });

  it('should create a new job with persistent disk', async () => {
    const existingPersistentDiskName = 'existing-persistent-disk-name';
    const newPersistentDiskName = 'new-persistent-disk-name';
    const disks = [
      {
        attached: 'newDisk',
        deviceName: newPersistentDiskName,
        newDisk: {
          diskInterface: '',
          sizeGb: '10',
          type: 'pd-balanced',
        },
      },
      {
        attached: 'existingDisk',
        deviceName: existingPersistentDiskName,
        existingDisk: `projects/${projectId}/regions/us-central1/disks/${existingPersistentDiskName}`,
      },
    ];

    const response = JSON.parse(
      execSync('node ./create/create_persistent_disk_job.js', {
        cwd,
      })
    );

    assert.deepEqual(
      response.allocationPolicy.instances[0].policy.disks,
      disks
    );
  });
});