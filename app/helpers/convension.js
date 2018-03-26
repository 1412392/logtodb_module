
function convertHexNCR2Char(str) {
    // converts a string containing &#x...; escapes to a string of characters
    // str: string, the input

    // convert up to 6 digit escapes to characters
    str = str.replace(/&#x([A-Fa-f0-9]{1,6});/g,
        function (matchstr, parens) {
            return hex2char(parens);
        }
    );
    return str;
}

function convertDecNCR2Char(str) {
    // converts a string containing &#...; escapes to a string of characters
    // str: string, the input

    // convert up to 6 digit escapes to characters
    str = str.replace(/&#([0-9]{1,7});/g,
        function (matchstr, parens) {
            return dec2char(parens);
        }
    );
    return str;
}

function convertZeroX2Char(str) {
    // converts a string containing 0x... escapes to a string of characters
    // str: string, the input

    // convert up to 6 digit escapes to characters
    str = str.replace(/0x([A-Fa-f0-9]{1,6})/g,
        function (matchstr, parens) {
            return hex2char(parens);
        }
    );
    return str;
}

function convertCSS2Char(str, convertbackslash) {
    // converts a string containing CSS escapes to a string of characters
    // str: string, the input
    // convertbackslash: boolean, true if you want \x etc to become x or \a to be treated as 0xA

    // convert up to 6 digit escapes to characters & throw away any following whitespace
    if (convertbackslash) {
        str = str.replace(/\\([A-Fa-f0-9]{1,6})(\s)?/g,
            function (matchstr, parens) {
                return hex2char(parens);
            }
        );
        str = str.replace(/\\/g, '');
    }
    else {
        str = str.replace(/\\([A-Fa-f0-9]{2,6})(\s)?/g,
            function (matchstr, parens) {
                return hex2char(parens);
            }
        );
    }
    return str;
}


function convertjEsc2Char(str, shortEscapes) {
    // converts a string containing JavaScript or Java escapes to a string of characters
    // str: string, the input
    // shortEscapes: boolean, if true the function will convert \b etc to characters

    // convert ES6 escapes to characters
    str = str.replace(/\\u\{([A-Fa-f0-9]{1,})\}/g,
        function (matchstr, parens) {
            return hex2char(parens);
        }
    );
    // convert \U and 6 digit escapes to characters
    str = str.replace(/\\U([A-Fa-f0-9]{8})/g,
        function (matchstr, parens) {
            return hex2char(parens);
        }
    );
    // convert \u and 6 digit escapes to characters
    str = str.replace(/\\u([A-Fa-f0-9]{4})/g,
        function (matchstr, parens) {
            return hex2char(parens);
        }
    );
    // convert \b etc to characters, if flag set
    if (shortEscapes) {
        //str = str.replace(/\\0/g, '\0'); 
        str = str.replace(/\\b/g, '\b');
        str = str.replace(/\\t/g, '\t');
        str = str.replace(/\\n/g, '\n');
        str = str.replace(/\\v/g, '\v');
        str = str.replace(/\\f/g, '\f');
        str = str.replace(/\\r/g, '\r');
        str = str.replace(/\\\'/g, '\'');
        str = str.replace(/\\\"/g, '\"');
        str = str.replace(/\\\\/g, '\\');
    }
    return str;
}



function convertpEnc2Char(str) {
    // converts a string containing precent encoded escapes to a string of characters
    // str: string, the input

    // find runs of hex numbers separated by % and send them for conversion
    str = str.replace(/((%[A-Fa-f0-9]{2})+)/g,
        function (matchstr, parens) {
            //return convertpEsc2Char(parens.replace(/%/g,' ')); 
            return convertpEsc2Char(parens);
        }
    );
    return str;
}


function convertEntities2Char(str) {
    // converts a string containing HTML/XML character entities to a string of characters
    // str: string, the input

    str = str.replace(/&([A-Za-z0-9]+);/g,
        function (matchstr, parens) { //alert(parens);
            if (parens in entities) { //alert(entities[parens]);
                return entities[parens];
            }
            else { return matchstr; }
        }
    );
    return str;
}


function convertNumbers2Char(str, type) {
    // converts a string containing HTML/XML character entities to a string of characters
    // str: string, the input
    // type: string enum [none, hex, dec, utf8, utf16], what to treat numbers as

    if (type == 'hex') {
        str = str.replace(/(\b[A-Fa-f0-9]{2,6}\b)/g,
            function (matchstr, parens) {
                return hex2char(parens);
            }
        );
    }
    else if (type == 'dec') {
        str = str.replace(/(\b[0-9]+\b)/g,
            function (matchstr, parens) {
                return dec2char(parens);
            }
        );
    }
    else if (type == 'utf8') {
        str = str.replace(/(( [A-Fa-f0-9]{2})+)/g,
            //str = str.replace(/((\b[A-Fa-f0-9]{2}\b)+)/g, 
            function (matchstr, parens) {
                return convertUTF82Char(parens);
            }
        );
    }
    else if (type == 'utf16') {
        str = str.replace(/(( [A-Fa-f0-9]{1,6})+)/g,
            function (matchstr, parens) {
                return convertUTF162Char(parens);
            }
        );
    }
    return str;
}






function convertUTF82Char(str) {
    // converts to characters a sequence of space-separated hex numbers representing bytes in utf8
    // str: string, the sequence to be converted
    var outputString = "";
    var counter = 0;
    var n = 0;

    // remove leading and trailing spaces
    str = str.replace(/^\s+/, '');
    str = str.replace(/\s+$/, '');
    if (str.length == 0) { return ""; }
    str = str.replace(/\s+/g, ' ');

    var listArray = str.split(' ');
    for (var i = 0; i < listArray.length; i++) {
        var b = parseInt(listArray[i], 16);  // alert('b:'+dec2hex(b));
        switch (counter) {
            case 0:
                if (0 <= b && b <= 0x7F) {  // 0xxxxxxx
                    outputString += dec2char(b);
                }
                else if (0xC0 <= b && b <= 0xDF) {  // 110xxxxx
                    counter = 1;
                    n = b & 0x1F;
                }
                else if (0xE0 <= b && b <= 0xEF) {  // 1110xxxx
                    counter = 2;
                    n = b & 0xF;
                }
                else if (0xF0 <= b && b <= 0xF7) {  // 11110xxx
                    counter = 3;
                    n = b & 0x7;
                }
                else {
                    outputString += 'convertUTF82Char: error1 ' + dec2hex(b) + '! ';
                }
                break;
            case 1:
                if (b < 0x80 || b > 0xBF) {
                    outputString += 'convertUTF82Char: error2 ' + dec2hex(b) + '! ';
                }
                counter--;
                outputString += dec2char((n << 6) | (b - 0x80));
                n = 0;
                break;
            case 2: case 3:
                if (b < 0x80 || b > 0xBF) {
                    outputString += 'convertUTF82Char: error3 ' + dec2hex(b) + '! ';
                }
                n = (n << 6) | (b - 0x80);
                counter--;
                break;
        }
    }
    return outputString.replace(/ $/, '');
}



function convertUTF162Char(str) {
    // Converts a string of UTF-16 code units to characters
    // str: sequence of UTF16 code units, separated by spaces
    var highsurrogate = 0;
    var suppCP;
    var n = 0;
    var outputString = '';

    // remove leading and multiple spaces
    str = str.replace(/^\s+/, '');
    str = str.replace(/\s+$/, '');
    if (str.length == 0) { return; }
    str = str.replace(/\s+/g, ' ');

    var listArray = str.split(' ');
    for (var i = 0; i < listArray.length; i++) {
        var b = parseInt(listArray[i], 16); //alert(listArray[i]+'='+b);
        if (b < 0 || b > 0xFFFF) {
            outputString += '!Error in convertUTF162Char: unexpected value, b=' + dec2hex(b) + '!';
        }
        if (highsurrogate != 0) {
            if (0xDC00 <= b && b <= 0xDFFF) {
                outputString += dec2char(0x10000 + ((highsurrogate - 0xD800) << 10) + (b - 0xDC00));
                highsurrogate = 0;
                continue;
            }
            else {
                outputString += 'Error in convertUTF162Char: low surrogate expected, b=' + dec2hex(b) + '!';
                highsurrogate = 0;
            }
        }
        if (0xD800 <= b && b <= 0xDBFF) { // start of supplementary character
            highsurrogate = b;
        }
        else {
            outputString += dec2char(b);
        }
    }
    return outputString;
}



function convertpEsc2Char(str) {
    // converts to characters a sequence of %-separated hex numbers representing bytes in utf8
    // str: string, the sequence to be converted

    var outputString = "";
    var counter = 0;
    var n = 0;

    var listArray = str.split('%');
    for (var i = 1; i < listArray.length; i++) {
        var b = parseInt(listArray[i], 16);  // alert('b:'+dec2hex(b));
        switch (counter) {
            case 0:
                if (0 <= b && b <= 0x7F) {  // 0xxxxxxx
                    outputString += dec2char(b);
                }
                else if (0xC0 <= b && b <= 0xDF) {  // 110xxxxx
                    counter = 1;
                    n = b & 0x1F;
                }
                else if (0xE0 <= b && b <= 0xEF) {  // 1110xxxx
                    counter = 2;
                    n = b & 0xF;
                }
                else if (0xF0 <= b && b <= 0xF7) {  // 11110xxx
                    counter = 3;
                    n = b & 0x7;
                }
                else {
                    outputString += 'convertpEsc2Char: error ' + dec2hex(b) + '! ';
                }
                break;
            case 1:
                if (b < 0x80 || b > 0xBF) {
                    outputString += 'convertpEsc2Char: error ' + dec2hex(b) + '! ';
                }
                counter--;
                outputString += dec2char((n << 6) | (b - 0x80));
                n = 0;
                break;
            case 2: case 3:
                if (b < 0x80 || b > 0xBF) {
                    outputString += 'convertpEsc2Char: error ' + dec2hex(b) + '! ';
                }
                n = (n << 6) | (b - 0x80);
                counter--;
                break;
        }
    }
    return outputString;
}



function convertXML2Char(str) {
    // converts XML or HTML text to characters by removing all character entities and ncrs
    // str: string, the sequence to be converted

    // remove various escaped forms
    str = convertHexNCR2Char(str);
    str = convertDecNCR2Char(str);
    str = convertEntities2Char(str);

    return str;
}





function convertUnicode2Char(str) {
    // converts a string containing U+... escapes to a string of characters
    // str: string, the input

    // first convert the 6 digit escapes to characters
    str = str.replace(/[Uu]\+10([A-Fa-f0-9]{4})/g,
        function (matchstr, parens) {
            return hex2char('10' + parens);
        }
    );
    // next convert up to 5 digit escapes to characters
    str = str.replace(/[Uu]\+([A-Fa-f0-9]{1,5})/g,
        function (matchstr, parens) {
            return hex2char(parens);
        }
    );
    return str;
}


function hex2char(hex) {
    // converts a single hex number to a character
    // note that no checking is performed to ensure that this is just a hex number, eg. no spaces etc
    // hex: string, the hex codepoint to be converted
    var result = '';
    var n = parseInt(hex, 16);
    if (n <= 0xFFFF) { result += String.fromCharCode(n); }
    else if (n <= 0x10FFFF) {
        n -= 0x10000
        result += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
    }
    else { result += 'hex2Char error: Code point out of range: ' + dec2hex(n); }
    return result;
}


function hex2char(hex) {
    // converts a single hex number to a character
    // note that no checking is performed to ensure that this is just a hex number, eg. no spaces etc
    // hex: string, the hex codepoint to be converted
    var result = '';
    var n = parseInt(hex, 16);
    if (n <= 0xFFFF) { result += String.fromCharCode(n); }
    else if (n <= 0x10FFFF) {
        n -= 0x10000
        result += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
    }
    else { result += 'hex2Char error: Code point out of range: ' + dec2hex(n); }
    return result;
}


function dec2char(n) {
    // converts a single string representing a decimal number to a character
    // note that no checking is performed to ensure that this is just a hex number, eg. no spaces etc
    // dec: string, the dec codepoint to be converted
    var result = '';
    if (n <= 0xFFFF) { result += String.fromCharCode(n); }
    else if (n <= 0x10FFFF) {
        n -= 0x10000
        result += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
    }
    else { result += 'dec2char error: Code point out of range: ' + dec2hex(n); }
    return result;
}

function dec2hex(textString) {
    return (textString + 0).toString(16).toUpperCase();
}

function dec2hex2(textString) {
    var hexequiv = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
    return hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
}

function dec2hex4(textString) {
    var hexequiv = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
    return hexequiv[(textString >> 12) & 0xF] + hexequiv[(textString >> 8) & 0xF]
        + hexequiv[(textString >> 4) & 0xF] + hexequiv[textString & 0xF];
}


function convertChar2CP(textString) {
    var haut = 0;
    var n = 0;
    var CPstring = '';
    for (var i = 0; i < textString.length; i++) {
        var b = textString.charCodeAt(i);
        if (b < 0 || b > 0xFFFF) {
            CPstring += 'Error in convertChar2CP: byte out of range ' + dec2hex(b) + '!';
        }
        if (haut != 0) {
            if (0xDC00 <= b && b <= 0xDFFF) {
                CPstring += dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)) + ' ';
                haut = 0;
                continue;
            }
            else {
                CPstring += 'Error in convertChar2CP: surrogate out of range ' + dec2hex(haut) + '!';
                haut = 0;
            }
        }
        if (0xD800 <= b && b <= 0xDBFF) {
            haut = b;
        }
        else {
            CPstring += dec2hex(b) + ' ';
        }
    }
    return CPstring.substring(0, CPstring.length - 1);
}

module.exports={

convertAllEscapes:function(str, numbers) {
    // converts all escapes in the text str to characters, and can interpret numbers as escapes too
    // str: string, the text to be converted
    // numbers: string enum [none, hex, dec, utf8, utf16], what to treat numbers as

    str = convertUnicode2Char(str); //alert(str);
    str = convertZeroX2Char(str); //alert(str);
    str = convertHexNCR2Char(str); //alert(str);
    str = convertDecNCR2Char(str); //alert(str);
    str = convertjEsc2Char(str, false); //alert(str);
    str = convertCSS2Char(str, false);  //alert(str);
    str = convertpEnc2Char(str);  //alert(str);
    str = convertEntities2Char(str); //alert(str);
    //str = convertNumbers2Char(str, numbers); //alert(str);

    return str;
}

}