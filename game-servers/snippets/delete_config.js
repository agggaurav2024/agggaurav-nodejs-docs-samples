// Copyright 2020, Google LLC.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * Delete a Game Servers Config.
 * @param {string} projectId string project identifier
 * @param {string} deploymentId unique identifier for the new Game Server Deployment
 * @param {string} configId unique identifier for the new Game Server Config
 */
async function main(
  projectId = 'YOUR_PROJECT_ID',
  deploymentId = 'DEPLOYMENT_ID',
  configId = 'CONFIG_ID'
) {
  // [START cloud_game_servers_config_delete]
  const {
    GameServerConfigsServiceClient,
  } = require('@google-cloud/game-servers');

  const client = new GameServerConfigsServiceClient();

  async function deleteGameServerConfig() {
    /**
     * TODO(developer): Uncomment these variables before running the sample.
     */
    // const projectId = 'Your Google Cloud Project ID';
    // const deploymentId = 'A unique ID for the Game Server Deployment';
    // const configId = 'A unique ID for the Game Server Config';
    const request = {
      // The full resource name
      name: client.gameServerConfigPath(
        projectId,
        'global',
        deploymentId,
        configId
      ),
    };

    const [operation] = await client.deleteGameServerConfig(request);
    await operation.promise();
    console.log(`Config with name ${request.name} deleted.`);
  }

  deleteGameServerConfig();

  // [END cloud_game_servers_config_delete]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
