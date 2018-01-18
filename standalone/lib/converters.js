/**
 * Takes a plain text sentence, returns a sentence in CoNLL-U format.
 * @param {String} text Input text (sentence)
 * @return {String}     Sentence in CoNLL-U format
 */
var anno_time = 0;
function plainSent2Conllu(text) {
    // TODO: if there's punctuation in the middle of a sentence,
    // indices shift when drawing an arc
    // punctuation


    text = text.replace(/([^ ])([.?!;:,])/g, "$1 $2");

    console.log('plainSent2Conllu() ' + text);

    var sent = new conllu.Sentence();
    
    // creating comments
    var lines;
    if (LOGGER_ENABLED) {
        anno_time = Date.now(); // Get first edit time
        lines = ["# sent_id = _" + "\n# text = " + text.replace('\n', '' + '\n# anno_time = ' + anno_time)];
    } else {
        lines = ["# sent_id = _" + "\n# text = " + text];
    }
    var tokens = text.split(" ");

    // enumerating tokens
    $.each(tokens, function(i, token) {tokens[i] = (i + 1) + "\t" + token});

    lines = lines.concat(tokens);
    sent.serial = lines.join("\n");

    // TODO: automatical recognition of punctuation's POS
    for(var i = 0; i < sent.tokens.length; i++) {
//       console.log(sent.tokens[i])
       if(sent.tokens[i]['form'].match(/^[!.)(»«:;?¡,"\-><]+$/)) {
//       if(sent.tokens[i]['form'].match(/\W/)) {
         sent.tokens[i]['upostag'] = 'PUNCT';
       }
       if(sent.tokens[i]['form'].match(/^[0-9]+([,.][0-9]+)*$/)) {
         sent.tokens[i]['upostag'] = 'NUM';
       }
       if(sent.tokens[i]['form'].match(/^[$%€£¥Æ§©]+$/)) {
         sent.tokens[i]['upostag'] = 'SYM';
       }
    }

    return sent.serial;
}

/**
 * Takes a string in CG, converts it to CoNLL-U format.
 * @param {String} text Input string(CG format)
 */
function SD2Conllu(text) {
        var newContents = [];
        newContents.push(SD2conllu(text));
        CONTENTS = newContents.join("\n");
        console.log('!!!' + CONTENTS);
        FORMAT = "CoNLL-U";
        loadDataInIndex();
        showDataIndiv();
}

/**
 * Takes a plain text, converts it to CoNLL-U format.
 * @param {String} text Input text
 */
function plainText2Conllu(text) {
    console.log('plainText2Conllu() ' + text);

    // if text consists of several sentences, process it as imported file
    if (text.match(/[^ ].+?[.!?](?=( |\n)[^ \n])/)) { // match sentence break, e.g. "blah. hargle"
        CONTENTS = text;
    }
    //console.log('plainText2Conllu() ' + text.length + ' // ' + text);
    if (CONTENTS.trim() != "") {
        var newContents = [];
        var splitted = CONTENTS.match(/[^ ].+?[.!?](?=( |$|\n))/g);
        //console.log('@ CONTENTS: ' + splitted.length);
        $.each(splitted, function(i, sentence) {
            newContents.push(plainSent2Conllu(sentence));
        })
        CONTENTS = newContents.join("\n");
        //console.log('@ CONTENTS: ' + CONTENTS);
        FORMAT = "CoNLL-U";
        AVAILABLESENTENCES = splitted.length;
        loadDataInIndex();
    } else {
        // If the CONTENTS is empty, then we need to fill it (this is the first time
        // we have put something into the annotatrix and CONTENTS will be empty if
        // it's the first time
        FORMAT = "CoNLL-U";
        //console.log('plainText2Conllu() ELSE ' + text);
        CONTENTS = plainSent2Conllu(text) + "\n";
        //console.log('plainText2Conllu() ELSE newContents ' + newContents);
        AVAILABLESENTENCES = 1;
        $("#indata").val(newContents);
        loadDataInIndex();
    }
}

/**
 * Takes a plain text, converts it to CoNLL-U format.
 * @param {String} text Input text
 */
function plainText2ConlluMod(text) {
    console.log('plainText2Conllu() ' + text);

    var corpus;
    // if text consists of several sentences, process it as imported file
    if (text.match(/[^ ].+?[.!?](?=( |\n)[^ \n])/)) { // match sentence break, e.g. "blah. hargle"
        corpus = text;
    }
    if (CONTENTS.trim() != "") {
        var newContents = [];
        var splitted = corpus.match(/[^ ].+?[.!?](?=( |$|\n))/g);
        $.each(splitted, function(i, sentence) {
            newContents.push(plainSent2Conllu(sentence));
        })
        corpus = newContents.join("\n");
        AVAILABLESENTENCES = splitted.length;
    } else {
        // If the CONTENTS is empty, then we need to fill it (this is the first time
        // we have put something into the annotatrix and CONTENTS will be empty if
        // it's the first time
        corpus = plainSent2Conllu(text) + "\n";
        AVAILABLESENTENCES = 1;
        $("#indata").val(newContents); // TODO: wtf, is newContents global var, or just undefined here?

        CONTENTS = corpus;
    }
    FORMAT = "CoNLL-U";
    loadDataInIndex();
}

/**
 * Checks if the input box has > 1 sentence.
 * @param {String} text Input text
 */
function conlluMultiInput(text) {
    if(text.match(/\n\n(#.*\n)?1\t/)) {
        console.log('conlluMultiInput()');

        // if text consists of several sentences, process it as imported file
        if (text.match(/\n\n/)) { // match doublenewline
            CONTENTS = text;
        }
    //    console.log('plainText2Conllu() ' + text.length + ' // ' + text);
        if (CONTENTS.trim() != "") {
            var newContents = [];
            var splitted = CONTENTS.split("\n\n");
            //console.log('@! ' + splitted.length);
            for(var i = 0; i < splitted.length; i++) {
                newContents.push(splitted[i]);
            }
            CONTENTS = newContents.join("\n\n");
            //console.log('!!!' + CONTENTS);
            FORMAT = "CoNLL-U";
            loadDataInIndex();
        }
    }
}

/**
 * Takes a string in CoNLL-U, converts it to plain text.
 * @param {String} text Input string
 * @return {String}     Plain text
 */
function conllu2plainSent(text) {
    var sent = new conllu.Sentence();
    sent.serial = text;
    var tokens = sent.tokens.map(function(token) {
        return token.form;
    })
    var plain = tokens.join(" ");
    return plain;
}

/**
 * Cleans up CoNNL-U content.
 * @param {String} content Content of input area
 * @return {String}     Cleaned up content
 */
function cleanConllu(content) {
    // if we don't find any tabs, then convert >1 space to tabs
    // TODO: this should probably go somewhere else, and be more
     // robust, think about vietnamese D:
    var res = content.search("\n");
    if(res < 0) {
        return content;
    }
    // maybe someone is just trying to type conllu directly...
    var res = (content.match(/_/g)||[]).length;
    if(res <= 2) {
        return content;
    }
    var res = content.search("\t");
    var spaceToTab = false;
    // If we don't find any tabs, then we want to replace multiple spaces with tabs
    if(res < 0) {
        spaceToTab = true;
    }
    // remove blank lines
    var lines = content.trim().split("\n");
    var newContent = "";
    for(var i = 0; i < lines.length; i++) {
        var newLine = lines[i].trim();
//        if(newLine.length == 0) {
//            continue;
//        }
        // If there are no spaces and the line isn't a comment, then replace more than one space with a tab
        if(newLine[0] != "#" && spaceToTab) {
            newLine = newLine.replace(/  */g, "\t");
        }
        // strip the extra tabs/spaces at the end of the line
        newContent = newContent + newLine + "\n";
    }
    return newContent;
}
