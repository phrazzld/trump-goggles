var ISIS_PATTERN = new RegExp('(ISIS)|(ISIL)|(Islamic State)|(Isis)|(Isil)', 'g')
var HILL_PATTERN = new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\. Clinton)', 'g')
var FAKENEWS_PATTERN = new RegExp('(MSNBC)|(NBC)|(NYTIMES)|(NYTimes)|(TNYT)|(NYT)|(New York Times)|(NBC News)|(HuffPo)|(Huffington Post)|(ABC News)|(American Broadcasting Company)|(CBS)', 'g')
var CNN_PATTERN = new RegExp('CNN', 'g')
var CRUZ_PATTERN = new RegExp('Ted Cruz', 'g')
var MARCO_PATTERN = new RegExp('(Marco Rubio)|(Rubio)', 'g')
var JEB_PATTERN = new RegExp('(Jeb Bush)|(Jeb)', 'g')
var WARREN_PATTERN = new RegExp('Elizabeth Warren', 'g')
var KIM_JONG_UN_PATTERN = new RegExp('(Kim Jong-un)|(Kim Jong Un)', 'g')
var BIDEN_PATTERN = new RegExp('Joe Biden', 'g')
var LAMB_PATTERN = new RegExp('Conor Lamb', 'g')
var BANNON_PATTERN = new RegExp('Steve Bannon', 'g')
var DURBIN_PATTERN = new RegExp('Dick Durbin', 'g')
var FEINSTEIN_PATTERN = new RegExp('Dianne Feinstein', 'g')
var FLAKE_PATTERN = new RegExp('Jeff Flake', 'g')
var FRANKEN_PATTERN = new RegExp('Al Franken', 'g')
var CORKER_PATTERN = new RegExp('Bob Corker', 'g')
var KELLY_PATTERN = new RegExp('Megyn Kelly', 'g')
var SCARBOROUGH_PATTERN = new RegExp('Joe Scarborough', 'g')
var MIKA_PATTERN = new RegExp('Mika Brzezinski', 'g')
var CHUCK_TODD_PATTERN = new RegExp('Chuck Todd', 'g')
var JIM_ACOSTA_PATTERN = new RegExp('Jim Acosta', 'g')
var CHUCK_SCHUMER_PATTERN = new RegExp('Chuck Schumer', 'g')
var BERNIE_PATTERN = new RegExp('Bernie Sanders', 'g')
var KASICH_PATTERN = new RegExp('John Kasich', 'g')
var ASSAD_PATTERN = new RegExp('Bashar (Hafez)? al-Assad', 'g')
var COFFEE_PATTERN = new RegExp('(coffee)|(Coffee)', 'g')



chrome.storage.sync.get(null, function(obj) {
    walk(document.body)
})

// Credit to t-j-crowder on StackOverflow for this walk function
// http://bit.ly/1o47R7V
function walk(node) {
    var child, next

    switch (node.nodeType) {
        case 1:  // Element
        case 9:  // Document
        case 11: // Document fragment
            child = node.firstChild
            while (child) {
                next = child.nextSibling
                walk(child)
                child = next
            }
            break
        case 3:  // Text node
            convert(node)
            break
    }
}

function convert(textNode) {
    var mappings = buildTrumpMap()
    var mapKeys = Object.keys(mappings)
    mapKeys.forEach(function (key) {
        textNode.nodeValue = textNode.nodeValue.replace(mappings[key].regex, mappings[key].nick)
    })
}

// Build RegEx patterns and replacements for each object of Trump's derision
function buildTrumpMap () {
    return {
        "cnn": {
            "regex": CNN_PATTERN,
            "nick": "Clinton News Network"
        },
        "kasich": {
            "regex": KASICH_PATTERN,
            "nick": "1 for 38 Kasich"
        },
        "bernie": {
            "regex": BERNIE_PATTERN,
            "nick": "Crazy Bernie"
        },
        "isis": {
            "regex": ISIS_PATTERN,
            "nick": "Evil Losers"
        },
        "hillary": {
            "regex": HILL_PATTERN,
            "nick": "Crooked Hillary"
        },
        "fakenews": {
            "regex": FAKENEWS_PATTERN,
            "nick": "Fake News"
        },
        "cruz": {
            "regex": CRUZ_PATTERN,
            "nick": "Lyin' Ted"
        },
        "marco": {
            "regex": MARCO_PATTERN,
            "nick": "Little Marco"
        },
        "jeb": {
            "regex": JEB_PATTERN,
            "nick": "Low Energy Jeb"
        },
        "warren": {
            "regex": WARREN_PATTERN,
            "nick": "Goofy Pocahontas"
        },
        "kimjongun": {
            "regex": KIM_JONG_UN_PATTERN,
            "nick": "Little Rocket Man"
        },
        "biden": {
            "regex": BIDEN_PATTERN,
            "nick": "Crazy Joe Biden"
        },
        "lamb": {
            "regex": LAMB_PATTERN,
            "nick": "Lamb the Sham"
        },
        "bannon": {
            "regex": BANNON_PATTERN,
            "nick": "Sloppy Steve"
        },
        "durbin": {
            "regex": DURBIN_PATTERN,
            "nick": "Dicky Durbin"
        },
        "feinstein": {
            "regex": FEINSTEIN_PATTERN,
            "nick": "Sneaky Dianne Feinstein"
        },
        "flake": {
            "regex": FLAKE_PATTERN,
            "nick": "Jeff Flakey"
        },
        "franken": {
            "regex": FRANKEN_PATTERN,
            "nick": "Al Frankenstein"
        },
        "corker": {
            "regex": CORKER_PATTERN,
            "nick": "Liddle' Bob Corker"
        },
        "kelly": {
            "regex": KELLY_PATTERN,
            "nick": "Crazy Megyn"
        },
        "scarborough": {
            "regex": SCARBOROUGH_PATTERN,
            "nick": "Psycho Joe"
        },
        "mika": {
            "regex": MIKA_PATTERN,
            "nick": "Dumb as a Rock Mika"
        },
        "chucktodd": {
            "regex": CHUCK_TODD_PATTERN,
            "nick": "Sleepy Eyes Chuck Todd"
        },
        "jimacosta": {
            "regex": JIM_ACOSTA_PATTERN,
            "nick": "Crazy Jim Acosta"
        },
        "chuckschumer": {
            "regex": CHUCK_SCHUMER_PATTERN,
            "nick": "Cryin' Chuck Schumer"
        },
        "coffee": {
            "regex": COFFEE_PATTERN,
            "nick": "covfefe"
        },
        "assad": {
            "regex": ASSAD_PATTERN,
            "nick": "Animal Assad"
        }
    }
}
