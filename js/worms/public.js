var companies = [];
var companiesHash = {};
var companiesLongNames = {};
var worms = [];
var wormsHash = {};
var sk = null;

var ee_;

var sim = {
    rotationalSpeed: 10,
    rotationalSpeed0: 30,
    companiesRadius: 200,
    width: 1024,
    height: 700,
    wormsMinVel: 25,
    wormsVel: 40,
    wormsMaxVel: 100,
    wormsMedVel: 40,
    imageCircle: new Image(),
    imageCircleVisited: new Image()
};

var utils = {
    wrapText: function(context, text, x, y, maxWidth, lineHeight) {

        var words = text.split(' ');
        var line = '';
        var stack = [];

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                stack.push([line, x, y]);
                //context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        stack.push([line, x, y]);
        //context.fillText(line, x, y);

        var verticalAlign = ((stack.length - 1) * lineHeight) / 2;
        stack.forEach(function(e) {
            context.fillText(e[0], e[1], e[2] - verticalAlign);
        });
    },
    removeFromArray: function(obj, arr) {
        var i = arr.indexOf(obj);
        if (i !== -1) {
            arr.splice(i, 1);
        }
    },
    stringCleaner: function(str) {
        var arr = str.split(" ");

        return arr.filter(function(s) {
            if (s == "de" || s == "do" || s == "da" || s == "a" || s == "o" || s == "e")
                return false;
            else
                return true;
        }).join(" ");
    },
    isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    getOutro: function(party){
        if(party == "CDS" || party == "PS" || party == "PSD"){
            return party;
        }else return "OUTRO";
    }

};


