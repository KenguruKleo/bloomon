## Creating Bouquets from flowers by SPEC

Read from stdin data with specification and write to stdout completed bouquets

### Architecture
1. Workers for the creating bouquets - one for small and one for large (but can be easy scale for any numbers)
2. Main process (switcher) read stream - chose appropriate worker and send data to it to create bouquet

Main process (switcher) and workers communicate by TCP sockets so they can be placed to separate environment

### Require
1. Node 8 or higher
2. Npm 5 or higher
3. Install necessary packages: `npm install`

### Run local separate workers and switcher
1. Run in one terminal workers: `npm run start:workers`
2. Run in other terminal: `npm run start:server < ./data/test-input.txt` or `node ./src/main.js < ./data/test-input.txt`

### Run local run all together
Workers will be created as child processes
1. Run in other terminal: `npm start < ./data/test-input.txt` or `node ./src/main-with-workers.js < ./data/test-input.txt`

### Run in docker
1. Build docker container `docker build --tag bloomon .`
2. Run `cat ./data/test-input.txt | docker run --rm -i bloomon`
