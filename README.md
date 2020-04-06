# Twist.moe CLI Batch Downloader
```sh
$ node dist/index.js animeID
```
*OR* (requires [NPM](https://www.npmjs.com/)/Yarn and [Node 8.x](https://nodejs.org/))
```sh
git clone https://github.com/Jelomite/twist-downloader.git
cd twist-downloader
yarn install
yarn build
node dist/index.js animeID
```
*animeID : https://twist.moe/a/[animeID]/8*
## Command line options
### Multiple animes
```sh
$ node dist/index.js animeID1 animeID2...
# example: $ node dist/index.js noragami kotoura-san
```
### Specific episode / range
```sh
$ node dist/index.js noragami           # will download all episodes.
$ node dist/index.js noragami/2         # will download only episode 2.
$ node dist/index.js noragami/4-10      # episode 4 -> 10
$ node dist/index.js noragami/4-        # episode 4 -> last episode
```
### Destination folder
```sh
$ node dist/index.js animeID1 animeID2 --destination myFolder
# files will be put inside 'myFolder' folder (created if not found)
# default is './downloads', note that each anime will have a subfolder.
```
