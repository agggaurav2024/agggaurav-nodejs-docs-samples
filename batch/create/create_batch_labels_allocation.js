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

async function main() {
  // [START batch_labels_allocation]
  // Imports the Batch library
  const batchLib = require('@google-cloud/batch');
  const batch = batchLib.protos.google.cloud.batch.v1;

  // Instantiates a client
  const batchClient = new batchLib.v1.BatchServiceClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  const projectId = await batchClient.getProjectId();
  // Name of the region you want to use to run the job. Regions that are
  // available for Batch are listed on: https://cloud.google.com/batch/docs/get-started#locations
  const region = 'europe-central2';
  // The name of the job that will be created.
  // It needs to be unique for each project and region pair.
  const jobName = 'batch-labels-allocation-job';
  // Name of the label1 to be applied for your Job.
  const labelName1 = 'vm_label_name_1';
  // Value for the label1 to be applied for your Job.
  const labelValue1 = 'vmLabelValue1';
  // Name of the label2 to be applied for your Job.
  const labelName2 = 'vm_label_name_2';
  // Value for the label2 to be applied for your Job.
  const labelValue2 = 'vmLabelValue2';

  // Define what will be done as part of the job.
  const runnable = new batch.Runnable({
    script: new batch.Runnable.Script({
      commands: ['-c', 'echo Hello world! This is task ${BATCH_TASK_INDEX}.'],
    }),
  });

  // Specify what resources are requested by each task.
  const computeResource = new batch.ComputeResource({
    // In milliseconds per cpu-second. This means the task requires 50% of a single CPUs.
    cpuMilli: 500,
    // In MiB.
    memoryMib: 16,
  });

  const task = new batch.TaskSpec({
    runnables: [runnable],
    computeResource,
    maxRetryCount: 2,
    maxRunDuration: {seconds: 3600},
  });

  // Tasks are grouped inside a job using TaskGroups.
  const group = new batch.TaskGroup({
    taskCount: 3,
    taskSpec: task,
  });

  // Policies are used to define on what kind of virtual machines the tasks will run on.
  // In this case, we tell the system to use "e2-standard-4" machine type.
  // Read more about machine types here: https://cloud.google.com/compute/docs/machine-types
  const instancePolicy = new batch.AllocationPolicy.InstancePolicy({
    machineType: 'e2-standard-4',
  });

  const allocationPolicy = new batch.AllocationPolicy({
    instances: [{policy: instancePolicy}],
  });
  // Labels and their value to be applied to the job and its resources.
  allocationPolicy.labels[labelName1] = labelValue1;
  allocationPolicy.labels[labelName2] = labelValue2;

  const job = new batch.Job({
    name: jobName,
    taskGroups: [group],
    labels: {env: 'testing', type: 'script'},
    allocationPolicy,
    // We use Cloud Logging as it's an option available out of the box
    logsPolicy: new batch.LogsPolicy({
      destination: batch.LogsPolicy.Destination.CLOUD_LOGGING,
    }),
  });

  // The job's parent is the project and region in which the job will run
  const parent = `projects/${projectId}/locations/${region}`;

  async function callCreateBatchLabelsAllocation() {
    // Construct request
    const request = {
      parent,
      jobId: jobName,
      job,
    };

    // Run request
    const [response] = await batchClient.createJob(request);
    console.log(JSON.stringify(response));
  }

  callCreateBatchLabelsAllocation();
  // [END batch_labels_allocation]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();
