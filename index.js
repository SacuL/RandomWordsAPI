//console.log("Initializing server...");

var PORT = process.env.PORT || 8080;
var isLocal = process.env.PORT ? false : true;
//console.log("Running in " + (isLocal ? "local " : "deployed ") + "mode");

var logger;
if(!isLocal){
    //console.log("Initializing logging...");
    var winston = require('winston');
    require('winston-papertrail').Papertrail;

    logger = winston.createLogger({
        transports : [
            new winston.transports.Papertrail({
                host: 'logs5.papertrailapp.com',
                port: 11708
            })
        ]
    });

    logger.info('Logging started');
}else{
    logger = {};
    logger.info = (a) => {console.log(a);};
}


logger.info('Loading Words Sync...');
let WORDS_DICT = [];
let DICT_LEN = 0;
function loadWordsDictSync(file){
    const path = require('path');
    const p = path.resolve(__dirname, file);
    const fs = require('fs');
    const contents = fs.readFileSync(p, 'utf8');

    WORDS_DICT = contents.split('\n');
    DICT_LEN = WORDS_DICT.length;
    logger.info(DICT_LEN + ' words loaded.');
}
loadWordsDictSync("google-10000-english-usa-no-swears-medium.txt");


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomWord(){
    return WORDS_DICT[Math.floor(getRandomArbitrary(0,DICT_LEN))];
}


var compression = require('compression');
var express = require('express');
var app = express();
app.use(compression());
app.listen(PORT);

app.get("/w", (req, res, next) => {
    let number_of_words = req.query.n || 10;
    if(isNaN(number_of_words) || number_of_words > 10 || number_of_words < 1) {
        number_of_words = 10;
    }
    number_of_words = Number(number_of_words);
    const result = [];
    for(let i = 0 ; i < number_of_words;i++){
        result.push(getRandomWord());
    }
    res.json(result);
});

app.get('/', (req, res) => {
    res.sendFile('./index.html', { root: __dirname });
});

logger.info('Server started at port '+PORT);