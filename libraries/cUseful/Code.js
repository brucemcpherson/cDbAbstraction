/** useful functions
 * cUseful
 **/
 
"use strict";

/** 
 * used for dependency management
 * @return {LibraryInfo} the info about this library and its dependencies
 */
function getLibraryInfo () {
  return {
    info: {
      name:'cUseful',
      version:'2.2.8',
      key:'Mcbr-v4SsYKJP7JMohttAZyz3TLx7pV4j',
      share:'https://script.google.com/d/1EbLSESpiGkI3PYmJqWh3-rmLkYKAtCNPi1L2YCtMgo2Ut8xMThfJ41Ex/edit?usp=sharing',
      description:'various dependency free useful functions'
    },
    dependencies:[]
  }; 
}
/** 
 * generateUniqueString
 * get a unique string
 * @param {number} optAbcLength the length of the alphabetic prefix
 * @return {string} a unique string
 **/
function generateUniqueString (optAbcLength) {
  var abcLength = isUndefined(optAbcLength) ? 3 : optAbcLength;
  return (new Date().getTime()).toString(36) + arbitraryString(abcLength) ;
}

/** 
 * check if item is undefined
 * @param {*} item the item to check
 * @return {boolean} whether it is undefined
 **/
function isUndefined (item) {
  return typeof item === 'undefined';
}

/** 
 * check if item is undefined
 * @param {*} item the item to check
 * @param {*} defaultValue the default value if undefined
 * @return {*} the value with the default applied
 **/
function applyDefault (item,defaultValue) {
  return isUndefined(item) ? defaultValue : item;
} 


/** 
 * get an arbitrary alpha string
 * @param {number} length of the string to generate
 * @return {string} an alpha string
 **/
function arbitraryString (length) {
  var s = '';
  for (var i = 0; i < length; i++) {
    s += String.fromCharCode(randBetween ( 97,122));
  }
  return s;
}

/** 
 * randBetween
 * get an random number between x and y
 * @param {number} min the lower bound
 * @param {number} max the upper bound
 * @return {number} the random number
 **/
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 
 * checksum
 * create a checksum on some string or object
 * @param {*} o the thing to generate a checksum for
 * @return {number} the checksum
 **/
function checksum(o) {
  // just some random start number
  var c = 23;
  if (!isUndefined(o)){
    var s =  (isObject(o) || Array.isArray(o)) ? JSON.stringify(o) : o.toString();
    for (var i = 0; i < s.length; i++) {
      c += (s.charCodeAt(i) * (i + 1));
    }
  }
  
  return c;
}
  
/** 
 * isObject
 * check if an item is an object
 * @memberof DbAbstraction
 * @param {object} obj an item to be tested
 * @return {boolean} whether its an object
 **/
function isObject (obj) {
  return obj === Object(obj);
};

/** 
 * clone
 * clone an object by parsing/stringifyig
 * @param {object} o object to be cloned
 * @return {object} the clone
 **/
function clone (o) {
  return o ? JSON.parse(JSON.stringify(o)) : null;
};

/**
 * recursive rateLimitExpBackoff()
 * @param {function} callBack some function to call that might return rate limit exception
 * @param {number} [sleepFor=1000] optional amount of time to sleep for on the first failure in missliseconds
 * @param {number} [maxAttempts=5] optional maximum number of amounts to try
 * @param {number} [attempts=1] optional the attempt number of this instance - usually only used recursively and not user supplied
 * @param {boolean} [optLogAttempts=false] log re-attempts to Logger
 * @return {*} results of the callback 
 */
  
function rateLimitExpBackoff ( callBack, sleepFor ,  maxAttempts, attempts , optLogAttempts ) {

  // can handle multiple error conditions by expanding this list
  function errorQualifies (errorText) {
    
    return ["Exception: Service invoked too many times",
            "Exception: Rate Limit Exceeded",
            "Exception: Quota Error: User Rate Limit Exceeded",
            "Service error: Spreadsheets",
            "Exception: User rate limit exceeded",
            "Exception: Internal error. Please try again.",
            "Exception: Cannot execute AddColumn because another task",
            "Service invoked too many times in a short time:",
            "Exception: Internal error.",
            "Exception: ???????? ?????: DriveApp."
           ]
            .some(function(e){
              return  errorText.toString().slice(0,e.length) == e  ;
            });
  }
  
  
  // sleep start default is  1 seconds
  sleepFor = Math.abs(sleepFor || 1000);
  
  // attempt number
  attempts = Math.abs(attempts || 1);
  
  // maximum tries before giving up
  maxAttempts = Math.abs(maxAttempts || 5);
  
  // check properly constructed
  if (!callBack || typeof(callBack) !== "function") {
    throw ("you need to specify a function for rateLimitBackoff to execute");
  }
  
  // try to execute it
  else {
    
    try {

      var r = callBack();
      return r;
    }
    catch(err) {
    
      if(optLogAttempts)Logger.log("backoff " + attempts + ":" +err);
      // failed due to rate limiting?
      if (errorQualifies(err)) {
        
        //give up?
        if (attempts > maxAttempts) {
          throw (err + " (tried backing off " + (attempts-1) + " times");
        }
        else {
          
          // wait for some amount of time based on how many times we've tried plus a small random bit to avoid races
          Utilities.sleep (Math.pow(2,attempts)*sleepFor) + (Math.round(Math.random() * sleepFor));
          
          // try again
          return rateLimitExpBackoff ( callBack, sleepFor ,  maxAttempts , attempts+1,optLogAttempts);
        }
      }
      else {
        // some other error
        throw (err);
      }
    }
  }
}

/**
 * append array b to array a
 * @param {Array.*} a array to be appended to 
 * @param {Array.*} b array to append
 * @return {Array.*} the combined array
 **/
function arrayAppend (a,b) {
  // append b to a
  if (b && b.length)Array.prototype.push.apply(a,b);
  return a;
}

/**
 * escapeQuotes()
 * @param {string} s string to be escaped
 * @return {string} escaped string
 **/
function escapeQuotes( s ) {
  return (s + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

/** get an array of objects from sheetvalues and unflatten them
 * @parameter {Array.object} values a 2 dim array of values return by spreadsheet.getValues()
 * @return {object} an object
 **/
function getObjectsFromValues  (values) {
  var obs = [];
  for (var i=1 ; i < values.length ; i++){
    var k = 0;
    obs.push(values[i].reduce (function (p,c) {
      p[values[0][k++]] = c;
      return p;
    } , {}));
  }
  return obs;
  
}

/* ranking an array of objects
 * @param {Array.object} array the array to be ranked
 * @param {function} funcCompare the comparison function f(a,b)
 * @param {function} funcStoreRank how to store rank f ( object , rank (starting at zero) , arr (the sorted array) )
 * @param {function} funcGetRank how to get rank f ( object)
 * @param {boolean} optOriginalOrder =false retin the original order
 * @return {Array.object} the array, sorted and with rank
 */
function arrayRank (array,funcCompare,funcStoreRank,funcGetRank,optOriginalOrder) {
  
  // default compare/getter/setters
  funcCompare = funcCompare ||   function (a,b) {
        return a.value - b.value;
      };
  funcStoreRank = funcStoreRank || function (d,r,a) {
        d.rank = r; 
        return d;
      };
  funcGetRank = funcGetRank || function (d) {
        return d.rank;
      } ;
      
  var sortable =  optOriginalOrder ? array.map(function (d,i) { d._xlOrder = i; return d; }) : array; 
      
  sortable.sort (function (a,b) {
    return funcCompare (a,b);
  })
  .forEach (function (d,i,arr) {
    funcStoreRank (d, i ? ( funcCompare(d, arr[i-1]) ?  i: funcGetRank (arr[i-1]) ) : i, arr );
  });
  
  if (optOriginalOrder) { 
    sortable.forEach (function (d,i,a) {
      funcStoreRank ( array[d._xlOrder], funcGetRank(d) , a );
    });
  }
  
  return array;
}

/**
 * format catch error
 * @param {Error} err the array to be ranked
 * @return {string} formatted error
 */
function showError (err) {

  try {
    if (isObject(err)) {
      if (e.message) {
        return "Error message returned from Apps Script\n" + "message: " + e.message + "\n" + "fileName: " + e.fileName + "\n" + "line: " + e.lineNumber + "\n";
      }
      else {
        return JSON.stringify(err);
      }
    }
    else {
      return err.toString();
    }
  }
  catch (e) {
    return err;
  }
}

 /**
 * identify the call stack
 * @param {Number} level level of call stack to report at (1 = the caller, 2 the callers caller etc..., 0 .. the whole stack
 * @return {object || array.object} location info - eg {caller:function,line:string,file:string};
 */
function whereAmI(level) {
  
  // by default this is 1 (meaning identify the line number that called this function) 2 would mean call the function 1 higher etc.
  level = typeof level === 'undefined' ? 1 : Math.abs(level);

  
  try {
    // throw a fake error
    var __y__ = __X_;  //x is undefined and will fail under use struct- ths will provoke an error so i can get the call stack
  }
  catch (err) {
    // return the error object so we know where we are
    var stack = err.stack.split('\n');
    if (!level) {
      // return an array of the entire stack
      return stack.slice(0,stack.length-1).map (function(d) {
        return deComposeMatch(d);
      });
    }
    else {
    
      // return the requested stack level 
      return deComposeMatch(stack[Math.min(level,stack.length-1)]);
    }

  }
  
  function deComposeMatch (where) {
    
    var file = /at\s(.*):/.exec(where);
    var line =/:(\d*)/.exec(where);
    var caller =/:.*\((.*)\)/.exec(where);
    

    return {caller:caller ? caller[1] :  'unknown' ,line: line ? line[1] : 'unknown',file: file ? file[1] : 'unknown'};

  }
}

/**
 * return an object describing what was passed
 * @param {*} ob the thing to analyze
 * @return {object} object information
 */
function whatAmI (ob) {

  try {
    // test for an object
    if (ob !== Object(ob)) {
        return {
          type:typeof ob,
          value: ob,
          length:typeof ob === 'string' ? ob.length : null 
        } ;
    }
    else {
      try {
        var stringify = JSON.stringify(ob);
      }
      catch (err) {
        var stringify = '{"result":"unable to stringify"}';
      }
      return {
        type:typeof ob ,
        value : stringify,
        name:ob.constructor ? ob.constructor.name : null,
        nargs:ob.constructor ? ob.constructor.arity : null,
        length:Array.isArray(ob) ? ob.length:null
      };       
    }
  }
  catch (err) {
    return {
      type:'unable to figure out what I am'
    } ;
  }
}

/**
 * a little like the jquery.extend() function
 * the first object is extended by the 2nd and subsequent objects - its always deep
 * @param {object} ob to be extended
 * @param {object...} repeated for as many objects as there are
 * @return {object} the first object extended
 */
function extend () {
  
    // we have a variable number of arguments
    if (!arguments.length) {
      // default with no arguments is to return undefined 
      return undefined;
    }
    
    // validate we have all objects
    var extenders = [],targetOb;
    for (var i = 0; i < arguments.length; i++) {
      if(arguments[i]) {
        if (!isObject(arguments[i])) {
          throw 'extend arguments must be objects not ' + arguments[i];
        }
        if (i ===0 ) {
          targetOb = arguments[i];
        } 
        else {
          extenders.push (arguments[i]);
        }
      }
    }
    
    // set defaults from extender objects
    extenders.forEach(function(d) {
        recurse(targetOb, d);
    });
    
    return targetOb;
   
    // run do a deep check
    function recurse(tob,sob) {
      Object.keys(sob).forEach(function (k) {
      
        // if target ob is completely undefined, then copy the whole thing
        if (isUndefined(tob[k])) {
          tob[k] = sob[k];
        }
        
        // if source ob is an object then we need to recurse to find any missing items in the target ob
        else if (isObject(sob[k])) {
          recurse (tob[k] , sob[k]);
        }
        
      });
    }
}

/**
 * @param {string} inThisString string to replace in
 * @param {string} replaceThis substring to be be replaced
 * @param {string} withThis substring to replace it with
 * @return {string} the updated string
 */
function replaceAll(inThisString, replaceThis, withThis) {
  return inThisString.replace (new RegExp(replaceThis,"g"), withThis);
}

/** 
 * make a hex sha1 string
 * @param {string} content some content
 * @return {string} the hex result
 */
function makeSha1Hex (content) {
  return byteToHexString(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, content));
}
/**
 * convert an array of bytes to a hex string
 * @param {Array.byte} bytes the byte array to convert
 * @return {string} the hex encoded string
 */
function byteToHexString (bytes) {
  return bytes.reduce(function (p,c) {
    return p += padLeading ((c < 0 ? c+256 : c).toString(16), 2 );
  },'');
}
/**
 * pad leading part of string
 * @param {string} stringtoPad the source string
 * @param {number} targetLength what the final string length should be
 * @param {string} padWith optional what to pad with - default "0"
 * @return {string} the padded string
 */
function padLeading (stringtoPad , targetLength , padWith) {
  return (stringtoPad.length <  targetLength ? Array(1+targetLength-stringtoPad.length).join(padWith | "0") : "" ) + stringtoPad ;
}
/**
 * get base64 encoded data as a string
 * @param {string} b64 as a string
 * @return {string} decoded as as string
 */
function b64ToString ( b64) {
  return Utilities.newBlob(Utilities.base64Decode(result.content)).getDataAsString();
}

