
class RULGenerator {

    debugCode = true;
    


roll() {
    var numberOfDice = 0;
    var numberOfSides = 0;
    var total = 0;
  
    if (arguments.length==2) {
      numberOfDice = arguments[0];
      numberOfSides = arguments[1];
    } else if (arguments.length==1) {
      var arg = arguments[0] + "";
      if (arg.indexOf("d") > 0)  {
        numberOfDice = arg.substring(0,arg.indexOf("d"));
        numberOfSides = arg.substr(arg.indexOf("d")+1);
      } else {
        numberOfDice = 1;
        numberOfSides = arguments[0];
      }
    }
  
    for (i=numberOfDice; i>0; i--) {
      total += Math.floor(Math.random()*numberOfSides) + 1;
    }
  
    return total;
  }

  randomElement (array) {
    return array[Math.floor(Math.random() * array.length)];
    }  

        // since javascript does not support POSIX character classes, 
    // we'll need our own version of [:punct:]
    punct='\\['+ '\\!'+ '\\"'+ '\\#'+ '\\$'+   
          '\\%'+ '\\&'+ '\\\''+ '\\('+ '\\)'+  
          '\\*'+ '\\+'+ '\\,'+ '\\\\'+ '\\-'+  
          '\\.'+ '\\/'+ '\\:'+ '\\;'+ '\\<'+   
          '\\='+ '\\>'+ '\\?'+ '\\@'+ '\\['+
          '\\]'+ '\\^'+ '\\_'+ '\\`'+ '\\{'+
          '\\|'+ '\\}'+ '\\~'+ '\\]';
    
    // Expression for breaking into tokens.
    tokenExp=new RegExp(     
       '\\s*'+            // discard possible leading whitespace
       '('+               // start capture group
         '\\.{3}'+            // ellipsis (must appear before punct)
       '|'+               // alternator
         '\\w+\\-\\w+'+       // hyphenated words (must appear before punct)
       '|'+               // alternator
         '\\w+\'(?:\\w+)?'+   // compound words (must appear before punct)
       '|'+               // alternator
         '\\w+'+              // other words
       '|'+               // alternator
         '['+ this.punct +']'+        // punct
       ')'                // end capture group
     );
   
    // Number Expression
    numberExp = /^\d+$/;   


    // generateRul - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Issue with IE and default value
    generateRul(requiredRule) {
        var result="";
        var optionalRuleSet = this.initializeRules();

        console.log("inside RulGen.js");
        //console.log("RequiredRule:" + requiredRule);
        
        console.log(optionalRuleSet);
        //Problem with IE
        //if (requiredRule in optionalRuleSet) {
        if (typeof(optionalRuleSet) === 'object') {
            if (optionalRuleSet.hasOwnProperty(requiredRule)) {
                var resultVal;
                let rule = optionalRuleSet[requiredRule];
                resultVal = this.randomElement(rule);
                //console.log(resultVal.split(tokenExp));
                if (typeof(resultVal) === 'string') {
                    result = this.parseResultSet({ resultGroup: resultVal.split(this.tokenExp), rulSet: optionalRuleSet});
                } else {
                    //console.log("coud not parse");
                    //console.log(resultVal);
                    result = "No Rule Found for: " + requiredRule;
                }
            } else {
                //console.log("Not a rule");
            }
            
        } else {
            //console.log("Rule set not defined");
        }
        
        console.log(result);
        if (typeof(result) === 'string') {
            for (cnt=0; cnt < 4; cnt++) {
                //console.log("Cleaning Result:" + result);
                result = result.replace("   ", " ");
                result = result.replace("  ", " ");
                result = result.replace("( ", "(");
                result = result.replace(" )", ")");
                result = result.replace(" s ", "s ");
                result = result.replace(" ,", ",");
                result = result.replace(" ,", ",");
                result = result.replace(" .", ".");
                result = result.replace('\" ', '\"');
                result = result.replace("with with", "with");
            }
        } else {
            //console.log("RESULT IS not a string:" + requiredRule);
            //console.log(result);
            result = "";
        }
        console.log(result);
        return result;
    };
    
    optional() {
        if (Math.floor((Math.random() * 100) + 1) > 50) {
            return true;
        }
        
        return false;
    }

    parseResultSet(resultsSet) {
        var result="";
        var optionalInclude = 0;
        var currentInclude = 0;
        var startExpression = 0;
        var expressionValue = 0;
        var addValue = 0;
        var subtractValue = 0;
        
        //console.log(resultsSet);
        //ie not supported
        //resultsSet.resultGroup.forEach(function(element) {
        for (var elementIndex = 0; elementIndex < resultsSet.resultGroup.length; elementIndex++) {
            var element = resultsSet.resultGroup[elementIndex];
            //console.log("")
            //console.log(element);
            // Check to see if start of Optional Element
            if (element == "[") {
                optionalInclude++;
                //console.log("Optional Element:" + optionalInclude);
                if (this.optional()) {
                    currentInclude++;
                    //console.log("Including current:" + currentInclude);
                }
                continue; // return foreach
            }
            
            if (element == "]") {
                if (currentInclude == optionalInclude) {
                    currentInclude--;
                }
                optionalInclude--;
                continue; // return foreach
            }
            
            if (currentInclude != optionalInclude) {
                continue;
            }
            if (element == "{") {
                //console.log("start exp");
                startExpression++;
                continue; // return foreach
            }
            if (element == "}") {
                //console.log("end exp:" + expressionValue);
                result += expressionValue;
                startExpression--;
                continue; // return foreach
            }
            if (startExpression > 0) {
                if (element.indexOf("d") >=0) {
                    expressionValue = this.roll(element);
                    //console.log("Val:" + expressionValue);
                    continue; // return foreach
                }
                if (element = "+") {
                    addValue++;
                    continue; // return foreach
                }
                if (element = "-") {
                    subtractValue++;
                    continue; // return foreach
                }
                if ((subtractValue > 0) && (numberExp.match(element))) {
                    expressionValue -= element;
                    subtractValue--;
                    continue; // return foreach
                } 
            }
    
            // Check to see if element in set
            if (element in resultsSet.rulSet) {
                result+=this.generateRul(element);
            } else {
                result += element + " ";
            }
            //console.log(result);
        };
        return result;
    };
    
    
    // grep(ary[,filt]) - filters an array
    //   note: could use jQuery.grep() instead
    // @param {Array}    ary    array of members to filter
    // @param {Function} filt   function to test truthiness of member,
    //   if omitted, "function(member){ if(member) return member; }" is assumed
    // @returns {Array}  all members of ary where result of filter is truthy
    grep (ary,filt) {
      var result=[];
      for(var i=0, len=ary.length; i<len; i++) {
        var member=ary[i]||'';
//        if(filt && (typeof filt === 'Function') ? filt(member) : member) {
//          result.push(member);
//        }
      }
      return result;
    };
    
    optional() {
        if (Math.floor((Math.random() * 100) + 1) > 50) {
            return true;
        }
        
        return false;
    }
    
    checkIfObjectIsEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
    }




    initializeRules() {
        var rule_set = {};
    rule_set['TESTRULESET'] = [
        '[Optional] COLOR item',
     ];
     
    rule_set['TESTRULESET2'] = [    
        '[STORED] Parchment [with the seal of a ANIMAL on it [in COLOR wax]] [[HUE]',
     ];    
    rule_set['TESTRULESET3'] = [    
        'Keyring with {1d4+1}x [METALLOW] keys one which is KEYTYPES ',
     ];
 
    rule_set['BARRELSMALL'] = [
         '[Worn ]Barrel made of WOOD wood with a SMALLVALUE',
         
        '[Worn ]Barrel full of [spoiled] FOODSTUFF',
        '[Worn ]Barrel full of USELESS',
    ];
    rule_set['CRATESMALL'] = [
         '[Worn ]Crate made of WOOD wood with a SMALLVALUE',
         
        '[Worn ]Crate full of [spoiled] FOODSTUFF',
        '[Worn ]Crate full of USELESS',
    ];
    rule_set['CRATEMEDIUM'] = [
         'Crate made of WOOD wood with a SMALLVALUE',
         'Crate made of WOOD wood with a MEDIUMVALUE',
        'Crate full of [spoiled] FOODSTUFF',
        'Crate full of USELESS',
    ];
 
    rule_set['USELESS'] = [
         'Coal',
         'stones',
         'rocks',
    ];
 
 
 
    rule_set['SMALLVALUEProfessional Specialties']  = [
         '[COLOR] SOFTMATERIAL Dress',
         '[COLOR] CLOTH Bolt',
         'METAL scissors',
         '[COLOR] CLOTH pouch containing FOODSTUFF',
         '[COLOR] CLOTH pouch containing [WOOD wood] buttons',
         'Fine METALLOW pin',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
    ];
    
    rule_set['SMALLVALUEGarment Trade']  = [
         '[COLOR] SOFTMATERIAL [CLOTHES]',
         '[COLOR] CLOTH CLOTHES',
         'METAL scissors',
         '[COLOR] CLOTH pouch',
         'Fine METALLOW pin',
        '[[Small] CLOTH SACKTYPE]',
    ];
 
     rule_set['CLOTHES'] = [
         'Dress',
         'Pants',
         'Shirt',
         'Smock', 
         'Hose', 
         'Kirtle', 
         'Dress', 
         'Belt', 
         'Surcoat', 
         'Girdle', 
         'Cape', 
         'Hood', 
         'Bonnet'
     ];
 
    rule_set['SMALLVALUEBlacksmith']  = [
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of ANIMAL fur',
        'Piece of COLOR CLOTH',
        'Small CLOTH SACKTYPE',
        '{1d7}x  HARDMATERIAL marbles',
        'ANIMAL paw',
        '{1d3}x SMALLSCALYTHINGS scales',
        'FOODSTUFF',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL     ',
        '[QUALITY] TOOLS',
        'Flint and steel',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
     
    rule_set['SMALLVALUEMerc']  = [
         'DAGGER',
        '[{1d4}x] HARDMATERIAL Die ',
        'FLOWER salve in a vial',
        '{1d4}x  BIRDTYPES feathers',
        'ANIMAL ANIMALBODYPART',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'TEETH',
        'STONES',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of ANIMAL fur',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        '{1d7}x  HARDMATERIAL marbles',
        '{1d4}x  BIRDTYPES eggs',
        'ANIMAL paw',
        '{1d3}x SMALLSCALYTHINGS scales',
        'FOODSTUFF',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL',
        'Flint and steel',
        'NATURALMATERIAL [voodoo]  doll ',
        '[Large] HARDMATERIAL spoon',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe',
        '[QUALITY] METALLOW tankard',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
     
    rule_set['SMALLVALUECriminal']  = [
         'DAGGER',
        '[{1d4}x] HARDMATERIAL Die ',
        'FLOWER salve in a vial',
        '{1d4}x  BIRDTYPES feathers',
        'ANIMAL ANIMALBODYPART',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'TEETH',
        'STONES',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of ANIMAL fur',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        '{1d7}x  HARDMATERIAL marbles',
        '{1d4}x  BIRDTYPES eggs',
        'ANIMAL paw',
        '{1d3}x SMALLSCALYTHINGS scales',
        'FOODSTUFF',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL',
        'Flint and steel',
        'NATURALMATERIAL [voodoo]  doll ',
        '[Large] HARDMATERIAL spoon',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe',
        '[QUALITY] METALLOW tankard',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
 
    rule_set['SMALLVALUEClergy']  = [
        'SCROLL',
        'FLOWER [FLOWERPART]  (flower)',
        'FLOWER salve in a vial',
        '{1d4}x  BIRDTYPES feathers',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        'FOODSTUFF',
        'FRAGILEMATERIAL bowl [filled with LIQUEDTYPE] ',
        'FRAGILEMATERIAL globe [filled with LIQUEDTYPE] ',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL',
        'NATURALMATERIAL [voodoo]  doll ',
        '[Large] HARDMATERIAL spoon',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
        'NATURALMATERIAL holy symbol',
        '[COLOR] CLOTH scarf'
     ];
 
    rule_set['SMALLVALUESage']  = [
        'SCROLL',
        'FLOWER [FLOWERPART]  (flower)',
        'FLOWER salve in a vial',
        '{1d4}x  BIRDTYPES feathers',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        'FOODSTUFF',
        'FRAGILEMATERIAL bowl [filled with LIQUEDTYPE] ',
        'FRAGILEMATERIAL globe [filled with LIQUEDTYPE] ',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL',
        'NATURALMATERIAL [voodoo]  doll ',
        '[Large] HARDMATERIAL spoon',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
 
 
    rule_set['SMALLVALUEArtisan']  = [
        'SCROLL',
        'FLOWER [FLOWERPART]  (flower)',
        'FLOWER salve in a vial',
        '{1d4}x  BIRDTYPES feathers',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        'FOODSTUFF',
        'FRAGILEMATERIAL bowl [filled with LIQUEDTYPE] ',
        'FRAGILEMATERIAL globe [filled with LIQUEDTYPE] ',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL',
        'NATURALMATERIAL [voodoo]  doll ',
        '[Large] HARDMATERIAL spoon',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
 
 
    rule_set['SMALLVALUEFarmer']  = [
        'FLOWER [FLOWERPART]  (flower)',
        'WOOD wood branch [ADWS] ',
        '{1d4}x  BIRDTYPES feathers',
        'ANIMAL ANIMALBODYPART',
        'KEYS',
        'TEETH',
        'STONES',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of ANIMAL fur',
        'Piece of COLOR CLOTH',
        'Small CLOTH SACKTYPE',
        '{1d7}x  HARDMATERIAL marbles',
        '{1d4}x  BIRDTYPES eggs',
        'ANIMAL paw',
        '{1d3}x SMALLSCALYTHINGS scales',
        'FOODSTUFF',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL',
        '[QUALITY] TOOLS',
        'Flint and steel',
        '[Large] HARDMATERIAL spoon',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe',
        'piece of [COLOR] string',
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
 
    rule_set['SMALLVALUECraftsman']  = [
        '[{1d4}x] HARDMATERIAL Die ',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'STONES',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of ANIMAL fur',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        '{1d7}x  HARDMATERIAL marbles',
        'ANIMAL paw',
        '{1d3}x SMALLSCALYTHINGS scales',
        'FOODSTUFF',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL     ',
        '[QUALITY] TOOLS',
        'Flint and steel',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe', 
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
 
    rule_set['SMALLVALUEMerchant']  = [
        '[{1d4}x] HARDMATERIAL Die ',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'STONES',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of ANIMAL fur',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        '{1d7}x  HARDMATERIAL marbles',
        'ANIMAL paw',
        '{1d3}x SMALLSCALYTHINGS scales',
        'FOODSTUFF',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL     ',
        '[QUALITY] TOOLS',
        'Flint and steel',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe', 
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
     ];
 
 
    rule_set['SMALLITEMS'] = [
         'SMALLVALUE and SMALLVALUE',
         'SMALLVALUE, SMALLVALUE and SMALLVALUE',
         'SMALLVALUE, SMALLVALUE, SMALLVALUE and SMALLVALUE',
         'SMALLVALUE, SMALLVALUE, SMALLVALUE, SMALLVALUE and SMALLVALUE',
    ];
 
    rule_set['SMALLVALUE']  = [
        '[[Small] CLOTH SACKTYPE with] VALUECARRIED',
        'FLOWER [FLOWERPART]  (flower)',
        '[{1d4}x] HARDMATERIAL Die ',
        'FLOWER salve in a vial',
        'WOOD wood branch [ADWS] ',
        '{1d4}x  BIRDTYPES feathers',
        'ANIMAL ANIMALBODYPART',
        'NATURALMATERIAL Comb',
        '[COLOR] Candle [shaped in the form of a ANIMAL] ',
        'KEYS',
        '[Polished] COLOR SEASHELLTYPES [on a METALLOW necklace]',
        'TEETH',
        'STONES',
        'Small NATURALMATERIAL chest [PATTERN2] ',
        'Piece of ANIMAL fur',
        'Piece of COLOR CLOTH',
        'NATURALMATERIAL case [PATTERN2] ',
        'Small CLOTH SACKTYPE',
        '{1d7}x  HARDMATERIAL marbles',
        '{1d4}x  BIRDTYPES eggs',
        'ANIMAL paw',
        '{1d3}x SMALLSCALYTHINGS scales',
        'FOODSTUFF',
        'FRAGILEMATERIAL bowl [filled with LIQUEDTYPE] ',
        'FRAGILEMATERIAL globe [filled with LIQUEDTYPE] ',
        'CLOTH pouch containing FOODSTUFF',
        'Carved MATERIAL ANIMAL',
        '[QUALITY] TOOLS',
        'Ear Trumpet',
        'Flint and steel',
        'NATURALMATERIAL [voodoo]  doll ',
        '[Large] HARDMATERIAL spoon',
        'NATURALMATERIAL [dog]  whistle',
        'NATURALMATERIAL [smoking]  pipe',
        '[QUALITY] METALLOW tankard',
    ];
 
 
    rule_set['MEDIUMVALUE']  = [
        'LIQUEDCONTAINER',
        '[STORED] Parchment [with the seal of a ANIMAL on it [in COLOR wax] ] ',
        'Magnifying Glass [with a HARDMATERIAL handle] ',
        'Small Silver Mirror [with a frame that is PATTERN] ',
        '[QUALITY] [METALLOW] Specticals [that have COLOR lenses] ',
        '[QUALITY] METALLOW Manacles',
        '[QUALITY] METALLOW Lock',
        'SMALLVALUE',
        'SMALLTOOL',
        'Small HARDMATERIAL chest [PATTERN]  that contains SMALLVALUE ',
        'Small CLOTH SACKTYPE that contains SMALLVALUE',
        'DAGGERSIMPLE',
        'CLOTH CLOTHINGTYPES',
        '{1d3}x MEDIUMSCALYTHINGS scales',
        '[QUALITY] METALLOW lantern',
        'FRAGILEMATERIAL flask [filled with LIQUEDTYPE] ',
        '[QUALITY] Hourglass',
        '[QUALITY] Sextant',
    ];
 
 
    rule_set['LARGEVALUE']  = [
        'METAL bar',
        'JEWELERY',
        'a BOOK',
        'HARDMATERIAL chest [PATTERN]  that contains MEDIUMVALUE',
        '{1d4}x COMMONGEMVALUES in a GEMCUTS',
        'Small CLOTH SACKTYPE that contains {1d4}x COMMONGEMVALUES in a GEMCUTS',
        'Small HARDMATERIAL chest [PATTERN]  that contains {1d4}x COMMONGEMVALUES in a GEMCUTS ',
        'Patch of ANIMALFUR fur',
        'Bolt of COLOR CLOTH',
        'NATURALMATERIAL rod with CARVING on top',
        'NATURALMATERIAL staff with CARVING on top',
        'HARDMATERIAL disk with CARVING in center',
        '{1d3}x LARGESCALYTHINGS scales',
    ];
 
 
    rule_set['CARVING']  = [
        'ANIMAL head carved [with 2x COMMONGEMVALUES for eyes]  ',
        'Claw carved',
        'ANIMAL carved',
    ];
 
 
    rule_set['STONES']  = [
        '[Polished] STONE Stone [PATTERN2]  [in a GEMCUTS] ',
        '[Polished] COLOR Stone [in a GEMCUTS] ',
    ];
 
 
    rule_set['KEYS']  = [
        'Keyring with {1d4+1}x [METALLOW] keys one which is KEYTYPES ',
        'A KEYTYPES',
        'String with {1d4+1}x [METALLOW] keys [one which is KEYTYPES] ',
        '[METALLOW] Chain with {1d4+1}x [METALLOW] keys [one which is KEYTYPES] ',
    ];
 
 
    rule_set['KEYTYPES']  = [
        '[QUALITY] [METALLOW] Key [that has a KEYGRIPS] ',
        '[QUALITY] METALLOW Key',
    ];
 
 
    rule_set['KEYGRIPS']  = [
        'ANIMAL shaped bow [with COMMONGEMVALUES for eyes]     ',
        'SCALYTHINGS shaped bow     ',
        'BIRDTYPES shaped bow',
        'METALMEDIUM bow [with an COMMONGEMVALUES] ',
        'plain bow',
    ];
 
 
    rule_set['QUALITY']  = [
        'Fine',
        'Rusted',
        'Worn',
        'Broken',
    ];
 
 
    rule_set['FURNITURETYPES']  = [
        'WOOD wood DESKTYPES',
    ];
 
 
    rule_set['DESKTYPES']  = [
        'standing desk with a drawer in the middle that has SMALLITEMS',
        'bureau with two lower drawrers that contain SMALLITEMS, SMALLITEMS and inside the top are SMALLITEMS, SMALLITEMS',
        'writting desk with SMALLITEMS on top and SMALLITEMS in the drawers',
        'rolltop desk  with SMALLITEMS on top and SMALLITEMS in the drawers',
        'Credenza with SMALLITEMS on top and SMALLITEMS in the drawers',
    ];
 
 
    rule_set['TOOLS']  = [
        'Drill                          ',
        'Glass Cutter',
        'Hammer',
        'Grappling Hook',
        'Piton',
        'Saw',
        '[METALLOW] Chisel',
        'Hand shovel',
        'Mallet',
    ];
 
 
    rule_set['SMALLTOOL']  = [
        'Hammer',
        '[METALLOW] Piton',
        'Glass Cutter',
        'Carving Knife',
        '[White] Chalk',
        '[METALLOW] Fishhook',
        '[METALLOW] Crowbar',
    ];
 
 
    rule_set['SACKTYPE']  = [
        'sack',
        'purse',
        'pouch',
        'sack made of SOFTMATERIAL',
        'purse made of SOFTMATERIAL',
        'pouch made of SOFTMATERIAL',
    ];
 
 
    rule_set['TEETH']  = [
        '{1d3+1}x [Long] [Sharp] ANIMAL CLAWTEETH',
    ];
 
 
    rule_set['CLAWTEETH']  = [
        'Teeth',
        'Claws',
    ];
 
 
    rule_set['LIQUEDCONTAINER']  = [
        '[COLOR] FRAGILEMATERIAL Bottle [with [thick] LIQUEDTYPE]  [and a STOPPERTYPE stopper] ',
        '[COLOR] FRAGILEMATERIAL Vial with [thick] LIQUEDTYPE [and a STOPPERTYPE stopper] ',
        '[COLOR] FRAGILEMATERIAL Vial with [thick] COLOR liqued [and a STOPPERTYPE stopper] ',
        '[COLOR] FRAGILEMATERIAL Vial [with [thick] LIQUEDTYPE]  [and a STOPPERTYPE stopper] ',
        '[COLOR] FRAGILEMATERIAL Vial [with [thick] COLOR liqued]  [and a STOPPERTYPE stopper] ',
        '[COLOR] FRAGILEMATERIAL vial with FLOWER salve',
        '[COLOR] FRAGILEMATERIAL vial with LIQURE',
    ];
 
 
    rule_set['LIQUEDTYPE']  = [
        'ANIMAL blood',
        '[dirty] water',
        'FLOWER salve',
        'Oil',
        'COLOR Paint',
    ];
 
 
 
    rule_set['LIQURE']  = [
        'Whiskey',
        'Ale',
        'Grog',
    ];
 
 
    rule_set['FRAGILEMATERIAL']  = [
        'Glass',
        'Crystal',
    ];
 
 
    rule_set['STORED']  = [
        'rolled',
        'wrapped',
        'folded',
    ];
 
 
    rule_set['ENHANCEMENTS']  = [
        'PATTERN on outside edge',
        'with a GEMVALUES in center [PATTERN on outside edge] ',
        'with {1d3+1}x GEMTYPES set around center [PATTERN on outside edge] [and a GEMVALUES in center] ',
        'with {1d3+1}x GEMTYPES set around center',
        'with METAL band ADJH around [PATTERN on outside edge]  [and a GEMVALUES in center]  [and {1d3+1} GEMTYPES set around center] ',
        'with METAL band running down middle [PATTERN on outside edge] ',
    ];
 
 
    rule_set['PATTERN']  = [
        'carved with DESIGN',
        'embossed with DESIGN',
        'etched with DESIGN',
    ];
 
 
    rule_set['PATTERN2']  = [
        'carved with DESIGN',
        'etched with DESIGN',
        'engraved with DESIGN',
    ];
 
 
    rule_set['DESIGN']  = [
        'flowers',
        'runes',
        'glyphs',
    ];
 
    rule_set['BOOK']  = [
        'BOOKTYPE1 [BOOKCONTENTS]  bound with BOOKBOUND that is PATTERN ',
        'BOOKTYPE1 [BOOKCONTENTS]  bound with BOOKBOUND that is PATTERN and has a METAL clasp [with ENHANCEMENTS]  ',
        'BOOKTYPE1 [BOOKCONTENTS]  bound with BOOKBOUND and METAL bans [with ENHANCEMENTS]  ',
        'BOOKTYPE1 [BOOKCONTENTS]  bound with BOOKBOUND and METAL bans that is PATTERN and has a METAL clasp [with ENHANCEMENTS]  ',
        'BOOKTYPE2 BOOKCONTENTS [ADJA with BINDING]   [with ENHANCEMENTS]  ',
        'SCROLL'
    ];
 
 
    rule_set['BOOKTYPE1']  = [
        'Book',
        'Tome',
        'Manual',
        'Codex',
    ];
 
 
    rule_set['BOOKTYPE2']  = [
        'Publication',
        'Writing',
        'Scroll',
        'Treatise',
    ];
 
 
    rule_set['BOOKTYPE3']  = [
        'Spellbook',
    ];
 
 
    rule_set['SCROLL'] = [
         'Scroll [BOOKCONTENTS] wrapped with SOFTMATERIAL ',
         'Scroll [BOOKCONTENTS] sealed with wax',
     ];
 
    rule_set['BOOKCONTENTS']  = [
        'BOOKABOUT BOOKCATAGORIES [BOOKQUALITY],',
    ];
 
 
    rule_set['BOOKABOUT']  = [
        'about',
        'detailing',
        'that specifies information on',
    ];
 
 
    rule_set['BOOKCATAGORIES']  = [
        'ANIMAL s ',
        'RAREGEMVALUES s ',
        'Foreign affairs',
        'crafting JEWELERYTYPES s ',
        'ancient battles',
        'Gods',
        'SKINCREATURES culture',
    ];
 
 
    rule_set['BINDING']  = [
        'string',
        'COLORHAIR hair',
        'SOFTMATERIAL',
    ];
 
 
    rule_set['BOOKQUALITY']  = [
        'that is barely legible',
        'written in a fine handwriting',
        'hand penned',
    ];
 
 
    rule_set['COLOR']  = [
        '[HUE] Red',
        '[HUE] Blue',
        '[HUE] Green',
        '[HUE] Black',
        '[HUE] Brown',
        '[Dirty] White',
        '[HUE] Orange',
        '[HUE] Pink',
        '[HUE] Grey',
        '[HUE] Purple',
        '[HUE] Silver',
    ];
 
 
    rule_set['DARKCOLOR']  = [
     '[HUE] Red',
     '[HUE] Black',
     '[HUE] Brown',
     '[HUE] Grey',
     '[HUE] Silver',
 ];  
 
    rule_set['HUE']  = [
        'Dark',
        'Light',
    ];
 
 
    rule_set['ANIMALBODYPART']  = [
        'CLAWTEETH',
        'claw',
        'bone',
        'eye',
        'tongue',
    ];
 
 
    rule_set['COLORHAIR']  = [
        '[HUE] COLOREARTH',
        'Blonde',
        'Silver',
        '[Dirty] White',
        '[HUE] Red',
    ];
 
 
    rule_set['COLOREARTH']  = [
        '[HUE] Brown',
        '[HUE] Black',
        '[HUE] Grey',
    ];
 
 
    rule_set['JEWELERY']  = [
        'HARDMATERIAL JEWELERYTYPES [ENHANCEMENTS] ',
        'HARDMATERIAL JEWELERYTYPES ENHANCEMENTS',
        'HARDMATERIAL JEWELERYTYPES [CHARMS] ',
        'HARDMATERIAL JEWELERYTYPES CHARMS',
        'NECKLACETYPES',
    ];
 
 
    rule_set['JEWELERYTYPES']  = [
        'Ring',
        'Earing',
        'Bracelet',
        'Belt Buckle',
        'Broach',
        'Amulet',
        'Arm Band',
        'Bracier',
        'Gauntlet',
        'Crown',
        'Circlet',
    ];
 
 
    rule_set['NECKLACETYPES']  = [
        'METAL Necklace CHARMS',
        'METAL Necklace',
        'METAL Chain [CHARMS] ',
        'METAL Torc [ENHANCEMENTS] ',
        'ADJA string [CHARMS] ',
        'ADJA [ANIMAL]  hair [CHARMS] ',
    ];
 
 
    rule_set['CHARMS']  = [
        'with a CHARMTYPES attached',
        'with a CHARMTYPES[, and a CHARMTYPES]  attached',
        'with a CHARMTYPES[, and a CHARMTYPES] [, and a CHARMTYPES] [, and a CHARMTYPES] [, and a CHARMTYPES]  attached',
    ];
 
 
    rule_set['CHARMTYPES']  = [
        'TEETH',
        'HARDMATERIAL Charm [in shape of a ANIMAL] ',
        'HARDMATERIAL pendent [ENHANCEMENTS] ',
        'HARDMATERIAL amulet [ENHANCEMENTS] ',
        'GEMTYPES hung by a METAL chain',
        'HARDMATERIAL bead',
    ];
 
 
    rule_set['CHARMSHAPES']  = [
        'ANIMAL',
        'SWORDTYPES',
    ];
 
 
    rule_set['STOPPERTYPE']  = [
        'METAL',
        'WOOD wood',
        '[COLOR] Glass',
        '[COLOR] Crystal',
    ];
 
    rule_set['BOOKBOUND'] = [
         'HARDMATERIAL',
         'leather',
         'SKINCREATURES skin',
    ];
 
    rule_set['HARDMATERIAL']  = [
        'METAL',
        'STONE',
        'WOOD wood',
        'Bone',
    ];
 
 
    rule_set['HARDMATERIALLIGHT']  = [
        'METAL',
        'WOOD wood',
        'Bone',
    ];
 
 
    rule_set['NATURALMATERIAL']  = [
        'WOOD wood',
        'Bone',
    ];
 
 
    rule_set['MATERIAL']  = [
        'HARDMATERIALLIGHT',
        'HARDMATERIAL',
        'FRAGILEMATERIAL',
    ];
 
 
    rule_set['VALUELARGE']  = [
        'GOLDL, SILVER',
        'GOLDL',
    ];
 
 
    rule_set['VALUECARRIED']  = [
        'VALUEMEDIUM',
        'GOLDM, SILVER',
    ];
 
    rule_set['VALUEMEDIUM']  = [
        'GOLDM',
        'VALUESMALL',
    ];
 
 
    rule_set['VALUESMALL']  = [
        'SILVER[, COPPER] ',
    ];
 
 
    rule_set['PLATINUM']  = [
        '{1d10}pp',
    ];
 
 
    rule_set['GOLDL']  = [
        '{1d15+1d3}gp',
    ];
 
 
    rule_set['GOLDM']  = [
        '{1d7}gp',
    ];
 
 
    rule_set['SILVER']  = [
        '{1d10}sp',
    ];
 
 
    rule_set['COPPER']  = [
        '{1d10}cp',
    ];
 
 
    rule_set['GEMTYPES']  = [
        'COMMONGEMVALUES in a GEMCUTS',
        'SEMIRAREGEMVALUES in a GEMCUTS',
        'RAREGEMVALUES in a GEMCUTS',
    ];
 
 
 
 
 
    rule_set['MINORGEM']  = [
        'COMMONGEMVALUES  gem',
    ];
 
 
    rule_set['FANCYGEMS']  = [
        'RAREGEMVALUES  gem',
    ];
 
    rule_set['GEMVALUES']  = [
        'COMMONGEMVALUES  gem',
        'RAREGEMVALUES gem',
        'SEMIRAREGEMVALUES gem',
    ];
 
 
 
    rule_set['LOSEGEMS']  = [
        'COMMONGEMVALUES  gem in a GEMCUTS',
        'SEMIRAREGEMVALUES gem in a GEMCUTS',
        'RAREGEMVALUES gem in a GEMCUTS',
    ];
 
 
    rule_set['GEMCUTS']  = [
        'Oval cut',
        'Emerald cut',
        'Square cut',
        'Princess cut',
        'Teardrop Shape cut',
        'Marquise cut',
        'Heart Shape cut',
        'Cushion cut',
        'Radiant cut',
        'Bead shape',
    ];
 
 
    rule_set['RAREGEMVALUES']  = [
        'Jade',
        'Pearl',
        'Spinel',
        'Tourmaline',
        'Aquamarine',
        'Garnet',
        'Peridot',
        'Topaz',
        'Black Opal',
        'Emerald',
        'Fire Opal',
        'Opal',
        'Oriental Amethyst',
        'Ariental Topaz',
        'Sapphire',
        'Star Ruby',
        'Star Sapphire',
        'Black Sapphire',
        'Diamond',
        'Emerald',
        'Jacinth',
        'Oriental Emerald',
        'Ruby',
        'Sapphire',
        'Star Ruby',
        'Star Sapphire',
    ];
 
 
    rule_set['SEMIRAREGEMVALUES']  = [
        'Moonstone',
        'Onyx',
        'Rock Crystal',
        'Sardonyx',
        'Smoky Quartz',
        'Star Rose Quartz',
        'Zircon',
        'Alexandrite',
        'Amethyst',
        'Chrysoberyl',
        'Coral',
        'Garnet',
        'Marble',
        'White Jade',
    ];
 
 
    rule_set['COMMONGEMVALUES']  = [
        'Azurite',
        'Seaweed Quartz',
        'Blue Quartz',
        'Hematite',
        'White Howlite', 
        'Lapis Lazuli',
        'Malachite',
        'Moss Agate',
        'Obsidian',
        'Rhodochrosite',
        'Tiger Eye',
        'Turquiose',
        'Amber',
        'Carnelian',
        'Chalcedony',
        'Chrysoprase',
        'White Quartz',
        'Banded Agate',
        'Jasper',
        'Red Jasper',
    ];
 
 
    rule_set['ARMORITEMS']  = [
        'SHIELD',
        'ARMOR made of METAL [and PATTERN] ',
    ];
 
 
    rule_set['WEAPONS']  = [
        'SWORD',
        'MACE',
        'SPEAR',
        'FLAIL',
        'DAGGER',
    ];
 
    rule_set['CRAFTEDWEAPONS'] = [
     'Sword',
     'Mace',
     'Spear',
     'Flail',
     'Dagger'
     ];
 
 
    rule_set['WEAPONTYPE']  = [
     'CRAFTEDWEAPONS',
     'CRAFTEDWEAPONS',
     'CRAFTEDWEAPONS',
     'CRAFTEDWEAPONS',
        'Fist',
    ];
 
 
    rule_set['SPEAR']  = [
        'Spear:  with a WOOD wood shaft [with feathers wrapped around it]  and a HARDMATERIAL head',
    ];
 
 
    rule_set['MACE']  = [
        'Mace:  with a HARDMATERIAL shaft and GRIP and a METAL [spiked] ball',
    ];
 
 
    rule_set['FLAIL']  = [
        'Flail:  with a HARDMATERIAL shaft and GRIP, a METAL chain and EITHER METAL [spiked] ball',
    ];
 
 
    rule_set['EITHER']  = [
        'a',
        '{1d3}x',
    ];
 
 
    rule_set['SWORD']  = [
        'SWORDTYPES',
    ];
 
 
    rule_set['SWORDTYPES']  = [
        'LONGSWORD',
        'KATANA',
        'BROADSWORD',
        'FALCHION',
        'KRYSS',
        'CUTLASS',
        'TWOHANDEDSWORD',
        'SHORTSWORD',
        'DRUSUS',
    ];
 
 
    rule_set['LONGSWORD']  = [
        'Long Sword:  POMMEL, BLADE',
    ];
 
 
    rule_set['KATANA']  = [
        'Katana:  POMMEL, BLADE',
    ];
 
 
    rule_set['BROADSWORD']  = [
        'Broad Sword:  POMMEL, BLADE',
    ];
 
 
    rule_set['FALCHION']  = [
        'Falchion:  POMMEL, BLADE',
    ];
 
 
    rule_set['KRYSS']  = [
        'Kryss:  POMMEL, BLADE',
    ];
 
 
    rule_set['CUTLASS']  = [
        'Cutlass:  POMMEL, BLADE',
    ];
 
 
    rule_set['TWOHANDEDSWORD']  = [
        'Two Handed Sword:  POMMEL, BLADE',
    ];
 
 
    rule_set['SHORTSWORD']  = [
        'Short Sword:  POMMEL, BLADE',
    ];
 
 
    rule_set['DRUSUS']  = [
        'Drusus:  POMMEL, BLADE',
    ];
 
 
    rule_set['DAGGERSIMPLE']  = [
        '[QUALITY] Dagger',
        '[QUALITY] Knife',
        '[QUALITY] Dirk',
        '[QUALITY] Hunting Dagger',
        '[QUALITY] Parrying Dagger',
    ];
 
 
    rule_set['DAGGER']  = [
        'Dagger:  POMMEL, BLADE',
        'Knife:  POMMEL, BLADE',
    ];
 
 
    rule_set['SHIELD']  = [
        'Buckler  Made of HARDMATERIALLIGHT with METAL etchings',
        'Kite Shield  Made of HARDMATERIALLIGHT with METAL etchings',
        'Large Shield  Made of HARDMATERIALLIGHT with METAL etchings',
        'Large Shield  Made of HARDMATERIALLIGHT with a ANIMAL in METAL etched in the middle',
    ];
 
 
    rule_set['ARMOR']  = [
        'METAL Platemail',
        'METAL Chainmail            ',
        'METAL Ringmail',
        'METAL Scalemail',
    ];
 
 
    rule_set['POMMEL']  = [
        'with a pommel that has a POMMELTIP and GRIP with a HILT',
    ];
 
 
    rule_set['BLADE']  = [
        'the blade is made of HARDMATERIALLIGHT [and PATTERN] ',
        'a curved blade is made of HARDMATERIALLIGHT [and PATTERN] ',
        'a wiggly blade is made of HARDMATERIALLIGHT [and PATTERN] ',
    ];
 
 
 
    rule_set['POMMELTIP']  = [
        '[ANIMAL head] [with 2 GEMTYPES for eyes] tip made of METAL, ',
        'GEMTYPES set in METAL,',
        '{1d3+1} GEMTYPES set around a METAL base,',
    ];
 
 
    rule_set['GRIP']  = [
        'the grip is made of [ADJS]  SOFTMATERIAL',
        'the grip is made of [ADJH]  METAL',
    ];
 
 
    rule_set['HILT']  = [
        'hilt made of METAL [and 2 GEMTYPES set on the ends] ',
        'a pair of ANIMAL  forming the hilt made of METAL',
    ];
 
 
    rule_set['ADJA']  = [
        'woven',
        'wrapped',
        'tied',
    ];
 
 
    rule_set['ADJS']  = [
        'wrapped',
        'covered',
    ];
 
 
    rule_set['ADJH']  = [
        'ribbed',
        'etched',
    ];
 
 
    rule_set['ADWS']  = [
        'Wrapped [in SOFTMATERIAL] ',
        'PATTERN2             ',
    ];
 
 
    rule_set['SOFTMATERIAL']  = [
        'LEATHER',
        'CLOTH',
    ];
 
 
    rule_set['LEATHER']  = [
        '[ANIMALFUR] leather',
        '[ANIMALFUR] hide',
        '[ANIMALFUR]  Fur',
    ];
 
 
    rule_set['CLOTH']  = [
        'canvas',
        'weave',
        'cotton',
        'linen',
        'velvet',
    ];
 
 
    rule_set['CLOTHINGTYPES']  = [
        'gloves',
        'pants',
        'trousers',
        'leggings',
        'belt',
        'hat',
        'longcoat',
        'surcoat',
        'tunic',
        'chemise',
        'cloak',
        'vest',
        'robe',
        'apron',
        'shoes',
        'sandles',
        'scarf',
        'jacket',
    ];
 
 
    rule_set['ANIMALFUR']  = [
        'Bear',
        'Rabbit',
        'Fox',
        'Wolf',
        'Beaver',
        'Lion',
        'Tigger',
        'Weasle',
        'Boar',
        'Leopard',
    ];
 
 
    rule_set['ANIMAL']  = [
        'Bear',
        'Rabbit',
        'Fox',
        'Wolf',
        'Beaver',
        'Eagle',
        'Griffon',
        'Lion',
        'Tigger',
        'Weasle',
        'Boar',
        'Leopard',
        'Hawk',
    ];
 
 
    rule_set['METALLOW']  = [
        'Iron',
        'Steal',
        'Copper',
        'Bronze',
    ];
 
 
    rule_set['METALMEDIUM']  = [
        'Gold',
        'Silver',
    ];
 
 
    rule_set['METALHIGH']  = [
        'Mithril',
        'Adamentite',
        'Platinum',
        'Blue Steal',
    ];
 
 
    rule_set['METAL']  = [
        'METALLOW',
        'METALMEDIUM',
        'METALHIGH',
    ];
 
 
    rule_set['WOOD']  = [
        'Maple',
        'Oak',
        'Ceder',
        'Pine',
        'Cherry',
        'Hickory',
        'Beech',
        'Red Oak',
        'Yellow Birch',
        'Beech',
        'Elm',
    ];
 
 
    rule_set['STONE']  = [
        'Granit',
        'Obsidian',
        'Quartz',
        'Slate',
    ];
 
 
    rule_set['SEASHELLTYPES']  = [
        'sand dollar',
        'sea shell',
        'olive shell',
        'auger shell',
        'top shell',
        'urchin',
        'starfish',
        'conch shell',
        'whelk shell',
        'surf clam shell',
        'oyster shell',
    ];
 
 
    rule_set['FLOWER']  = [
        'Allnight',
        'Belladonna',
        'Dreamers star',
        'Flayleaf',
        'Garlic',
        'Goblinvine',
        'Holly',
        'Leaves, Golden Maple',
        'Leechwort',
        'Lichen',
        'Mistletoe',
        'Poppy tears',
        'Tea, meditation',
        'Tea, night',
        'Tobacco',
        'Twilight dagger',
        'Winterbite',
        'Wolfsbane     ',
    ];
 
 
    rule_set['BIRDTYPES']  = [
        'Albatross',
        'Blackbird',
        'Bluebird',
        'Crane',
        'Crow',
        'Dove',
        'Duck',
        'Eagle',
        'Egret',
        'Falcon',
        'Finch',
        'Goldfinch',
        'Goose',
        'Gull',
        'Hawk',
        'Hummingbird',
        'Jay',
        'Kingfisher',
        'Loon',
        'Magpie',
        'Mockingbird',
        'Nutcracker',
        'Osprey',
        'Owl',
        'Pelican',
        'Pheasant',
        'Peacock',
        'Pigeon',
        'Quail',
        'Raven',
        'Robin, American',
        'Sandpiper',
        'Shrike',
        'Sparrow',
        'Stork',
        'Swallow',
        'Swan, Tundra',
        'Thrasher',
        'Thrush',
        'Turkey',
        'Vulture',
        'Woodpecker',
        'Wren                ',
    ];
 
 
 
 
    rule_set['FOODSTUFF']  = [
        '[Dried] Spices',
        '[Dried] Fruit',
        'Smoked Meat',
        'Dried Meat',
        'Rolled Tobacco',
        'Oil cask',
        'Slab of Bacon',
        'Ale cask',
        'Potatoes',
        '{2d4}x Potatoes',
        'Salted Herring',
        'Wheat Flour',
        'Oat Flour',
        'Eggs',
        '{1d4+1}x Eggs',
        'Hunk of Cheese',
        'Loaf of Bread',
    ];
 
 
    rule_set['FLOWERPART']  = [
        'leaf',
        'patels',
        'leaves',
        'stem [and leaf] ',
        'stem and pistil',
    ];
 
 
    rule_set['SCALYTHINGS']  = [
        'SMALLSCALYTHINGS',
        'MEDIUMSCALYTHINGS',
        'LARGESCALYTHINGS',
    ];
 
 
    rule_set['SMALLSCALYTHINGS']  = [
        'Small Lizard',
        'Gecko',
        'Fish',
        'Snake',
    ];
 
 
    rule_set['MEDIUMSCALYTHINGS']  = [
        'Large Lizard',
        'Large Snake',
        'Wyvern',
        'Salamander',
        'Lizardman ',
        'Yaunti ',
    ];
 
 
    rule_set['LARGESCALYTHINGS']  = [
        'Giant Lizard',
        '[COLOR] Dragon',
        'Hydra',
        'DEMON',
        'Manticore',
     ];
     
    rule_set['CREATURES'] = [
         'SCALYTHINGS',
         'BIRDTYPES',
         'HUMANOIDS',
    ];
 
    rule_set['SKINCREATURES']  = [
        'Human',
        'Elven',
        'Dwarven',
        'Gnomish',
        'Halfling',
        'MONSTERHUMANOIDS',
        'DEMON',
        'DEVIL'       
     ];
 
    rule_set['DEVIL'] = [
         'Barbazu',
         'Barbed Devil',
         'Bearded Devil',
         'Bezekira',
         'Bone Devil',
         'Chain Devil',
         'Cornugon',
         'Erinyes',
         'Gelugon',
         'Hamatula',
         'Hellcat',
         'Horned Devil',
         'Ice Devil',
         'Imp',
         'Kyton',
         'Lemure',
         'Osyluth',
         'Pit Fiend'
     ];   
 
    rule_set['DEMON']  = [
         'Babau',
         'Balor',
         'Bebilith',
         'Dretch',
         'Glabrezu',
         'Hezrou',
         'Marilith',
         'Nalfeshnee',
         'Quasit',
         'Retriever',
         'Succubus',
         'Vrock',
         'DEMONLORDS'       
     ];
     
     rule_set['DEMONLORDS'] = [
         'Abraxas',
         'Adimarchus',
         'Ahazu',
         'Ahrimanes',
         'Aldinach',
         'Alrunes',
         'Alvarez',
         'Alzrius',
         'Anarazel',
         'Ansitif',
         'Ardat',
         'Areex',
         'Arlgolcheir',
         'Arzial',
         'Aseroth',
         'Asima',
         'Astaroth',
         'Azael',
         'Azazel',
         'Azuvidexus',
         'Baltazo',
         'Baphomet',
         'Barbu',
         'Bayemon',
         'Bechard',
         'Cabiri',
         'Charun',
         'Chernovog',
         'Codricuhn',
         'Cyndshyra',
         'Dagon',
         'Demogorgon',
         'Dwiergus',
         'Eblis',
         'Ebulon',
         'Eldanoth',
         'Eltab',
         'Ereshkigal',
         'Felex\'ja',
         'Fraz-Urb\'luu',
         'Gorion',
         'Graz\'zt',
         'Gresil',
         'Haagenti',
         'Ilsidahur',
         'Ixinix',
         'Juiblex',
         'J\'zzalshrak',
         'Kardum',
         'Kerzit',
         'Kostchtchie',
         'Lupercio',
         'Lynkhab',
         'Obox-ob',
         'Prince of Demons',
         'Socothbenoth',
         'Soneillon'
     ];    
    
    rule_set['GENERICMONSTER'] = [
         'werewolf',
         'demon',
         'vampire',
         'undead',
         'lich',
         'goblinoid',
         'humanoid creature',
         'ghost',
    ];
     
    rule_set['HUMANOIDS']  = [
        'Human',
        'Elven',
        'Dwarven',
        'Gnomish',
        'Halfling',
        'MONSTERHUMANOIDS'
     ];
     
    rule_set['MONSTERHUMANOIDS']  = [
        'Kobold',
        'Goblin',
        'Orc',
        'Lizardman',
        'Hobgoblin',
        'Drow',
     ];
     
     rule_set['INCENSE'] = [
         "Amber(Air)",
         "Cedarwood(Fire)",
         "Cinnamon(Fire)",
         "Frankincense(Water)",
         "Ginger(Fire)",
         "Jasmine(Water/Earth)",
         "Lavender(Water)",
         "Lotus(Air)",
         "Musk(Earth)",
         "Myrrh(Spirit)",
         "Nag Champa(All Elements*)",
         "Opium(Air)",
         "Patchouli(Fire/Earth)",
         "Rose(Water/fire)",
         "Sandalwood(Fire/Water)",
         "Vanilla(Air)",
     ];
     
     rule_set['SIZE'] = [
         'gargantuan',
         'huge',
         'large',
         'medium',
         '',
         'small',
         'tiny',
     ];
     
 
     rule_set['WEIGHT'] = [
         'Heavy',
         'Lite'
     ];
 
     rule_set['DESCRIPTORS'] = [
         'Bloody',
         'Burning',
         'Calm',
         'Couragous',
         'Crooked',
         'Cursed',
         'Daring',
         'Diligent',
         'Dull',
         'Fabulous',
         'Floating',
         'Faithful',
         'Happy',
         'Hidden',
         'Honest',
         'Humble',
         'Immortal',
         'Limping',
         'Merciful',
         'QUALITY',
         'Shattered',
         'Shinning',
         'Sly',
         'Soaked',
         'Stout',
         'Wise',
         'FRAGILEMATERIAL',
     ];
     
     rule_set['AGEDESC'] = [
         'Old',
         'New'
     ];
 
     rule_set['STORAGECONTAINER'] = [
         '[warn ]STORAGECONTAINERTYPE'
     ];
 
     rule_set['STORAGECONTAINERTYPE'] = [
         'WOOD barrel',
         'WOOD crate',
         'WOOD chest'
     ];
 
 
 
     rule_set['DRINKS'] = [
         'Ale',
         'Beer',
         'Stout',
     ];
     
     
     rule_set['TAVERNENDINGS'] = [
         'House',
         'Mug',
         'Cup',
         'Room',
     ];
     
     
     
     
     rule_set['HOSTELERSNAME'] = [
         'The [COLOR]  CREATURES',
         'The [COLOR] [DESCRIPTORS] JEWELERYTYPES',
         'The [COLOR]  MONSTERHUMANOIDS [CLAWTEETH]',
         'The [COLOR]  ANIMAL',
         'The [COLOR]  LARGESCALYTHINGS [CLAWTEETH]',
         'The [QUALITY] [DESCRIPTORS] CREATURES',
         'The [QUALITY] [DESCRIPTORS] MEDIUMSCALYTHINGS [CLAWTEETH]',
         'The [QUALITY]  [DESCRIPTORS] SMALLSCALYTHINGS [CLAWTEETH]',
         'The [DESCRIPTORS]  TAVERNENDINGS [of MATERIAL]',
         'The [DESCRIPTORS]  House [of WEAPONTYPE]s',
         'The [COLOR] ANIMAL',
         'The METAL DRINKS [TAVERNENDINGS]',
         'The WOOD  DRINKS [TAVERNENDINGS]'
         ];
     
     rule_set["ANIMALHANDLERNAME"] = [
         'ANIMAL Traders',
         'ANIMAL Movers'
     ];
     rule_set["ARTISANNAME"] = [
         'The Well Oiled Canvas'
     ];
     rule_set["BLACKSMITHNAME"] = [
         'MERCHANTNAME',
         'The METALLOW Anvil',
         'The METALLOW Armor'
     ];
     rule_set["BUTCHERNAME"] = [
         'MERCHANTNAME',
         'The DOMESTICANIMAL Cutters',
         'The DOMESTICANIMAL Butcher',
         'The Bloody DOMESTICANIMAL'
     ];
     
     rule_set['WORSHIP'] = [
         'House',
         'Temple',
         'Sanctuary',
         'Mosque',
         'Church',
         'Shrine',
         'Pantheon',
         'Shrine',
         'Sanctum',
         'Altar',
         'Pagoda',
         'Monestery',
         'Cathedral',
         'Chapel',
         'Missionary'
     ];
     
     
     
     rule_set['STATE'] = [
         'Braveness',
         'Divine',
         'Delight'
     
     ];
     
     rule_set['TRANQUILPLACES'] = [
         'Grove',
         'Plantation',
         'Orchard',
         'Well',
         'Chamber'
     ];
     
     rule_set["CLERGYNAME"] = [
         'The [COLOR ] WORSHIP',
         'The Old [COLOR ] WORSHIP',
         'The Guilty [COLOR ] WORSHIP',
         'The Timeless [COLOR ] WORSHIP',
         '[The ][COLOR ]WORSHIP of the TRANQUILPLACES',
         '[The ][COLOR ]WORSHIP[ of the STATE]',
         '[The ][High ]WORSHIP[ of the STATE]',
         '[The ][High ]WORSHIP[ of the TRANQUILPLACES]'
     ];
     rule_set["CARPENTERNAME"] = [
         'MERCHANTNAME',
         '[The ]WOOD FURNITURE',
         '[The ]Long [WOOD ]FURNITURE',
         '[The ]Fine [WOOD ]FURNITURE'
     
     ];
     rule_set["CONSTRUCTIONNAME"] = [
         '[The ][WOOD ]Workshop'
     ];
     rule_set["CRAFTSMANNAME"] = [
         'MERCHANTNAME',
         '[The ][WOOD ]Workshop'
     ];
     rule_set["BLACKMARKETTYPE"] = [
         'MERCHANTNAME',
         'Alley',
         'Warehouse'
     ];
     rule_set["CRIMINALNAME"] = [
         'The DARKCOLOR BLACKMARKET'
     ];
     rule_set["ELECTEDOFFICIALNAME"] = [
         'The Office'
     ];
     rule_set["ENTERTAINERNAME"] = [
         'MERCHANTNAME',
         'The [DARKCOLOR ]Theatre',
         'The [DARKCOLOR ][Open ]Stage'
         
     ];
     rule_set["COOKNAME"] = [
         'MERCHANTNAME',
         'The DOMESTICANIMAL Meat Processors',
         'The DOMESTICANIMAL Butcher',
         'The Bloody DOMESTICANIMAL',
         'The Cooked DOMESTICANIMAL'
     
     ];
     rule_set["GARMENTTRADENAME"] = [
         'MERCHANTNAME',
         '[The ]Warehouse',
         'The Garment Shop'
     ];
     rule_set["GUARDNAME"] = [
         'The [Old ]Barracks'
     ];
     
     rule_set['QUALITYCONDITION'] = [
         'rugged',
         'fancy',
     ]
     
     rule_set['HOSTELERSNAME'] = [
         'MERCHANTNAME',
         'The [COLOR]  CREATURES',
         'The [COLOR] [DESCRIPTORS] JEWELERYTYPES',
         'The [COLOR]  MONSTERHUMANOIDS [CLAWTEETH]',
         'The [COLOR]  ANIMAL',
         'The [COLOR]  LARGESCALYTHINGS [CLAWTEETH]',
         'The [QUALITY] [DESCRIPTORS] CREATURES',
         'The [QUALITY] [DESCRIPTORS] MEDIUMSCALYTHINGS [CLAWTEETH]',
         'The [QUALITY]  [DESCRIPTORS] SMALLSCALYTHINGS [CLAWTEETH]',
         'The [DESCRIPTORS]  TAVERNENDINGS [of MATERIAL]',
         'The [DESCRIPTORS]  House [of WEAPONTYPE]s',
         'The [COLOR] ANIMAL',
         'The METAL DRINKS [TAVERNENDINGS]',
         'The WOOD  DRINKS [TAVERNENDINGS]'
         ];
         
     rule_set["KNIGHTNAME"] = [
         'MERCHANTNAME',
         'The[ COLOR] Barracks',
         'The[ COLOR] House'
     ];
     rule_set["LABORERNAME"] = [
         'MERCHANTNAME',
         'The[ COLOR] Warehouse',
     ];
     rule_set["LAUNDRESSNAME"] = [
         'MERCHANTNAME',
         'The[ QUALITYCONDITION]  Shop',
     ];
     rule_set["LIBRARIANNAME"] = [
         'MERCHANTNAME',
         'The[ QUALITYCONDITION]  Shop',
         'The[ BOOKTYPE1] Shop',
         'The[ BOOKTYPE2] Shop',
         'The[ BOOKTYPE1] House',
         'The[ BOOKTYPE2] House',
 
     ];
     rule_set["LOCKSMITHNAME"] = [
         'MERCHANTNAME',
         'The[ QUALITYCONDITION] Lock',
     ];
     rule_set["MAGICALARTISANNAME"] = [
         'MERCHANTNAME',
         'The[ QUALITYCONDITION] Shop',
     ];
     rule_set["MAGICALTUTORNAME"] = [
         'MERCHANTNAME',
         'The[ QUALITYCONDITION] Shop',
     ];
     
 
     rule_set["MERCNAME"] = [
         'The[ QUALITYCONDITION] shop',
     ];
     
     rule_set["MAIDSERVANTNAME"] = [
         'The[ QUALITYCONDITION] shop',
     ];
 
     rule_set["MERCHANTNAME"] = [
         'The Sellers House',
         'The Shop around the corner',
         'The[ QUALITYCONDITION] shop',
     ];
     rule_set["MASONNAME"] = [
         'MERCHANTNAME',
     
     ];
     rule_set["MAYORNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MEATBUTCHERNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MERCERNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MESSENGERNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MILLERNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MISTRALNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MISSIONARYNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MONEYCHANGERNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["MOUNTAINMANNAME"] = [
         'MERCHANTNAME',
     ];
     rule_set["NOBLENAME"] = [
         'House of Vegora',
         'Delrose Villa',
         'Walton Manor'
     ];
     rule_set["OILTRADERNAME"] = [
         '[The ]Oily Barrel'
     ];
     rule_set["PAINTERARTNAME"] = [
         'The[ COLOR] Canvas'
     ];
     rule_set["PAINTERBUILDINGNAME"] = [
         'The[ COLOR] Wall Painter'
     
     ];
     rule_set["PASTRYMAKERNAME"] = [
         'The Cook',
         'Pastry Shop'
     ];
     rule_set["PAWNBROKERNAME"] = [
         'We Trade it'
     ];
     rule_set["PHYSICCHIRURGEONNAME"] = [
         'Mental Surgery'
     ];
     rule_set["PIRATENAME"] = [
         'Lost Galleon'
     ];
     rule_set["PLASTERERNAME"] = [
         'The Stone Wall',
         'Mortar Masters'
     
     ];
     rule_set["PORTERNAME"] = [
         'We carry Everything'
     
     ];
     rule_set["POTTERNAME"] = [
         'The Pottery Barn'
     ];
     rule_set["PREACHERNAME"] = [
         'Sandbox WORSHIP'
     ];
     rule_set["PRIESTNAME"] = [
         'Place of worship',
         'WORSHIP of Prayers'
     ];
     rule_set["PRINCENAME"] = [
         'Castle'
     ];
 
     rule_set['PLACESOFLEARNING'] = [
         'Library',
         'School',
         'College',
         'Academy',
         'Conservatory',
         'Lyceum',
         'Museum',
         'Seminary',
         'University',
         'Institute',
         'Campus'
     ]
     rule_set["PROFESSORNAME"] = [
         'PLACESOFLEARNING of learning',
         'PLACESOFLEARNING of Teaching'
     ];
     rule_set["PURSEMAKERNAME"] = [
         'The Handy Holder',
         'Purse of Holding'
     ];
     rule_set["ROOFERNAME"] = [
         'We Top it',
         'Roofs are us',
         'Roof Carpenter'
     ];
     rule_set["ROPEMAKERNAME"] = [
         'Roper Shop'
     ];
     rule_set["RUGMAKERNAME"] = [
         'Under your feet',
         'Rug Maker'
     ];
     rule_set["SADDLERNAME"] = [
         'Saddler'
     ];
     rule_set["PROFESSIONALSPECIALTIESNAME"] = [
         'Specialist'
     ];
     rule_set["SAGENAME"] = [
         'PLACESOFLEARNING Tower'
     ];
     rule_set["SAILMAKERNAME"] = [
         'Linen Warf',
         'Warfs Sails',
         'The Outrigger'
     ];
     rule_set["SAILORNAME"] = [
         'Dockside',
         'The Outrigger'
     ];
     rule_set["SCOUTNAME"] = [
         'Ranger'
     ];
     rule_set["SCRIBENAME"] = [
         'Town Scribe'
     ];
     rule_set["SCULPTORNAME"] = [
         'Stone Carvings'
     ];
     rule_set["SELLSPELLNAME"] = [
         'You pay, we cast'
     ];
     rule_set["SHIPBUILDERNAME"] = [
         'Shipwright warehouse'
     ];
     rule_set["SHOEMAKERNAME"] = [
         'The Foots shop'
     ];
     rule_set["SOAPMAKERNAME"] = [
         'Make it clean'
     ];
     rule_set["SPICERMAKERNAME"] = [
         'Exoitic Spices'
     ];
     rule_set["SQUIRENAME"] = [
         "The Squires Roost"
     ];
     rule_set["STABLERNAME"] = [
         "Horses Correl"
     ];
     rule_set["TAILORNAME"] = [
         'The [COLOR] CLOTH Seemstress'
     ];
     rule_set["TANNERNAME"] = [
         'Tanners Shop'
     ];
     rule_set["TAVERNERNAME"] = [
         'HOSTELERSNAME'
     ];
     rule_set["TEAMSTERNAME"] = [
         'Works Warehouse'
     ];
     rule_set["THIEFNAME"] = [
         'MERCHANTNAME',
         'Alley',
         'Warehouse'
     ];
     rule_set["THUGNAME"] = [
         'MERCHANTNAME',
         'Alley',
         'Warehouse'
     ];
     rule_set["TINKERNAME"] = [
         'The Tinkerers Workshop'
     ];
     rule_set["TOWNJUSTICENAME"] = [
         'Citys Center'
     ];
     rule_set["TRACKERNAME"] = [
         'The Mountain Men'
     ];
     rule_set["TROUBADOURSNAME"] = [
         'The Music Hall'
     ];
     rule_set["TUTORNAME"] = [
         'PLACESOFLEARNING Tower'
     ];
     rule_set["USEDGARMENTTRADERNAME"] = [
         'The [COLOR] CLOTH Seemstress'
     ];
     rule_set["VISCOUNTNAME"] = [
         'The Viscount Keep'
     ];
     rule_set["SPECIALTYSERVICENAME"] = [
         'Specialty Shop'
     ];
     rule_set["WAGONMAKERNAME"] = [
         'Wagon Maker'
     ];
     rule_set["WATERCARRIERNAME"] = [
         'Water Porter'
     ];
     rule_set["WEAPONDEALERNAME"] = [
         
     ];
     rule_set["WEAPONSMITHNAME"] = [
         '[The] WEIGHT BLACKSSMITHITEMS',
     ];
     rule_set["WEAVERNAME"] = [
         'The [COLOR] CLOTH Weaver'
     ];
     rule_set["WHEELWRIGHTNAME"] = [
         'Wheelwright'
     ];
     rule_set["WINESELLERNAME"] = [
         'Corked Grapes'
     ];
     rule_set["WOODCARVERNAME"] = [
         'Make if from Wood'
     ];
     rule_set["WOODSELLERNAME"] = [
         'We have things to burn'
     ];
     rule_set["FARMERNAME"] = [
         'The [COLOR] ANIMAL Farm',
 
     ];
     rule_set["FARMERCABBAGENAME"] = [
         'Cabbage Patch Kids'
     ];
     rule_set["FARMERCATTLEHERDERNAME"] = [
         'The [COLOR] ANIMAL herder',
     ];
     rule_set["FARMERCORNNAME"] = [
         'Corn Farmer'
     ];
     rule_set["FARMERCOWHERDERNAME"] = [
         'Cow Herder'
     ];
     rule_set["FARMERGOATHERDERNAME"] = [
         'Goat Herder'
     ];
     rule_set["FARMERPIGHERDERNAME"] = [
         'Pig Herder'
     ];
     rule_set["FARMERPOTATONAME"] = [
         'Potato Farmer'
     ];
     rule_set["FARMERSHEEPHERDERNAME"] = [
         'Sheep Herder'
     ];
     rule_set["FARMERWHEATNAME"] = [
         'Wheat Farmer'
     ];
     rule_set["FARMERSPECIALNAME"] = [
         'Special Farmer'
     ];
     rule_set["FARMERFISHMONGERNAME"] = [
         'Fish Farmer'
     ];
 
     
 rule_set['BUILDINGHEIGHT'] = [
     'tall',
     'two story',
     'one story'
 ];
 
 rule_set['SIDINGTYPES'] = [
     'shingled',
     'planked', 
     'brick',
     'stoned'
 ];
 
 rule_set['FOUNDATIONDAMAGE'] = [
     'breaks',
     'holes',
     'cracks'
 ];
 
 rule_set['FOUNDATIONTYPES'] = [
     'open air',
     'enclosed planked[ with FOUNDATIONDAMAGE in it]', 
     'brick[ with breaks in it]',
     'stone[ with breaks in it]'
 ];
 
 rule_set['FOUNDATIONJUNK'] = [
     'junk[ and [large] stones]',
     '[broken] [WOOD] barrels[ and [large] stones]',
     '[broken] barrels [and crates][ and [large] stones]'
 ];
 
 rule_set['FOUNDATIONINFO'] = [
     "The house foundation is FOUNDATIONTYPES[ and FOUNDATIONJUNK strewn about].",
 ];
 
 rule_set['PAINTCONDITION'] =[
     'faded',
     'new'
 ];
 
 rule_set['ROOFTYPES'] = [
     'shingled roof',
     'planked roof', 
     'thatched roof',
     'roof with thatching made of straw',
 ];
 
 rule_set['ROOFINFO'] = [
     'A shingled roof.',
     'A planked roof.', 
     'A thatched roof.',
     'A roof with thatching made of straw.',
 ];
 
 
 rule_set['BUILDINGDESCRIPTION'] = [
     'HOUSEINFO ROOFINFO FOUNDATIONINFO ADDITIONALBUILDINGINFO'
 ];
 
 rule_set['WINDOWINFO'] = [
     'shuttered',
     'broken',
     'boarded'
 ];
 
 rule_set['INDUSTRY'] = [
     'Agriculture',
     'Trade',
     'Miners',
     "Fishing",
     "Manufacturing"
 ];
 
 rule_set['MARKET'] = [
     "Trade Route",
     "Market",
     "Barter",
     "Local Fair"
 ];
 
 rule_set['HOUSESIDINGINFO'] = [
     'with SIDINGTYPES siding[ with a few [WINDOWINFO] windows]',
 
 ];
 
 rule_set['ADDITIONALBUILDINGINFO'] = [
     'A [WOOD] shed is attached to the side.',
     'A [WOOD] pergola is attached to the side.',
     'A [WOOD] shed structure is to the side.',
 ];
 
 rule_set['HOUSEINFO'] = [
     'An [AGEDESC] [long] [BUILDINGHEIGHT]  building  [with PAINTCONDITION paint and ] HOUSESIDINGINFO. ',
     'An [AGEDESC] [narrow] [BUILDINGHEIGHT] building [with PAINTCONDITION paint and ]  HOUSESIDINGINFO.',
     'An [AGEDESC] [BUILDINGHEIGHT] building [with PAINTCONDITION paint and ] HOUSESIDINGINFO.'
 
 ];
 
 
 rule_set['BLACKSSMITHITEMS'] = [
     'WEAPONTYPE',
     'Anvil',
     '[METAL] Cauldron',
     '[METAL] Pot',
 ];
 
 rule_set['BLACKSMITHNAME'] = [
     '[The] WEIGHT BLACKSSMITHITEMS',
 ];
 
 
 rule_set['BLACKSMITHSITTINGABOUT'] = [
     'A WEAPONS is displayed on a table.',
     'A STORAGECONTAINER filled with water, with a TOOLS leaning against the base.',
     'A STORAGECONTAINER filled with nails[, with a TOOLS leaning against the base].',
     'A STORAGECONTAINER filled with METALLOW shavings[, with a TOOLS leaning against the base].',
     'A STORAGECONTAINER filled with METALLOW bars[, with a TOOLS leaning against the base].',
     'A saw horse with hay strewn about, a sledge hammer leaning on the edge.'
 ];
 
 
 
 rule_set['BLACKSMITHLOCATION'] = [
     'yard',
     'shed',
     'smithy'
 ];
 
 
 rule_set['BUILDINGDESCRIPTIONBLACKSMITH'] = [
     'An [AGEDESC] [BUILDINGHEIGHT] building [with PAINTCONDITION paint].',
     'A [AGEDESC] long [BUILDINGHEIGHT]  building with a smithy attached to the side.',
     'A [AGEDESC] [BUILDINGHEIGHT] building with a smithy attached to the side.',
     'A [AGEDESC] [BUILDINGHEIGHT] building with a smithy structure to the side.',
 ];
 
 rule_set['BLACKSMITHBUILDINGDESCRIPTION'] = [
     'BUILDINGDESCRIPTION An [CONDITION ]anvil sits in outside BLACKSMITHLOCATION[ a large smith hammer lying across the top][ with various CRAFTEDWEAPONS scattered about]. [BLACKSMITHSITTINGABOUT] [BLACKSMITHSITTINGABOUT]',
     'BUILDINGDESCRIPTION An [CONDITION ]anvil sits in outside BLACKSMITHLOCATION[ a large smith hammer lying across the top][ with various CRAFTEDWEAPONS lying about]. [BLACKSMITHSITTINGABOUT] [BLACKSMITHSITTINGABOUT]',
     'BUILDINGDESCRIPTION An [CONDITION ]anvil sits in the corner of the BLACKSMITHLOCATION[ a large smith hammer lying across the top][ with various CRAFTEDWEAPONS lying about]. [BLACKSMITHSITTINGABOUT] [BLACKSMITHSITTINGABOUT]',
 ];
 
 rule_set['CONDITION'] = [
     'rusted',
     'polished'
 ];
 
 
 rule_set['GOVERNMENTTYPES'] = [
     'Democracy',
     'Monarchy',
     'Anarchy',
     'Dictatorship',
     'Oligarchy',
     'Republic',
     'Theocracy',
     'Totalitarian',
     'Feudalism',
     'Socialism',
     'Magocracy',
     'Federation',
     'Confederation',
     'Aristocracy',
     'Plutocracy'
 ];
 
 rule_set['KINGDOMPREFIX'] = [
     'Borough',
     'Dominion',
     'Empire',
     'Grand Duchy',
     'Kingdom',
     'League',
     'Principality',
     'Protectorate',
     'Realm',
     'Republic',
     'Sovereignty',
     'Theocracy',
     '',
     '',
     '',
     '',
     '',
     '',
     '',
     '',
     '',
 ];
 
 rule_set['KINGDOMGOALS'] = [
     'Kingdom goals'
 ];
 
 rule_set['CULTURE'] = [
     "Aboriginal",
     "African",
     "Arabic",
     "Aztec",
     "Incan",
     "Barbarian",
     "Central Asian",
     "Egyptian",
     "Renaissance",
     "European",
     "Indian",
     "Oriental",
     "Persian",
     "Roman",
     "Savage",
     "Viking",
 ];
 
 rule_set['TECHNOLOGY'] = [
     'Stone Age',
     'Savage',
     'Bronze Age',
     'Roman',
     'Dark Ages',
     'Crusades',
     'Renaissance'
 ];
 
 
 
 
 rule_set['TRADESGOODLIST'] = [
     'TRADEGOODS',
     'TRADEGOODS, TRADEGOODS',
     'TRADEGOODS, TRADEGOODS, TRADEGOODS',
 ];
 
 rule_set['TRADEGOODS'] = [
     'Ore',
     'Metals',
     'Tin',
     'Copper',
     'Iron',
     'Lead',
     'Gold',
     'Silver',
     'Construction Stone',
     'Limestone',
     'Sandstone',
     'Granite',
     'Marble',
     'Carving Stone',
     'Soapstone',
     'Alabaster',
     'Turquoise',
     'Jade',
     'Malachite',
     'Gemstones',
     'RAREGEMVALUES',
     'SEMIRAREGEMVALUES',
     'COMMONGEMVALUES',
     'Silicates',
     'Quartz',
     'Glass',
     'Ceramics',
     'Salt',
     'Hides',
     'Furs',
     'Skins',
     'Leather',
     'Wool',
     'Silk',
     'Ivory',
     'Tortoise Shells',
     'Whale Bones',
     'Grease',
     'Lard',
     'Honey',
     'Beeswax',
     'Perls',
     'Coral',
     'Shells',
     'Cotton',
     'Linen',
     'Jute',
     'Bamboo',
     'Grain',
     'Amber',
     'Lacquer',
     'Lumber',
     'WOOD Lumber',
     'Wine',
     'Beer',
     'Mead',
     'Dyes',
     'Herbs',
     'Incense',
     'Spices'
 ];
 
 
 rule_set['POWERLEVELS'] = [
     'Strong',
     'Weak',
     'Moderate'
 ];
 
 rule_set['MILITARYABILITIES'] = [
     'Leadership',
     'Teamwork',
     'Integrity',
     'Persistence', 
     'Bravery', 
     'Social intelligence', 
     'Fairness', 
     'Self-regulation',
     'Leadership',
     'Teamwork',
     'Integrity',
     'Persistence', 
     'Bravery', 
     'Social intelligence', 
     'Fairness', 
     'Self-regulation',
     'Leadership',
     'Teamwork',
     'Integrity',
     'Persistence', 
     'Bravery', 
     'Social intelligence', 
     'Fairness', 
     'Self-regulation',
     'Leadership',
     'Teamwork',
     'Integrity',
     'Persistence', 
     'Bravery', 
     'Social intelligence', 
     'Fairness', 
     'Self-regulation',
 ];
 
 
 rule_set['REBELLIOUSNESS'] = [
     'Individual',
     'Collective',
     'Civil disobedience',
     'Civil resistance', 
     'Nnonviolent resistance',
     'Terrorism', 
     'Sabotage',
     'Guerrilla warfare'
 ];
 
 rule_set['MILITARYSTRENGHT'] = [
     'MILITARYABILITIES POWERLEVELS',
     'MILITARYABILITIES POWERLEVELS, MILITARYABILITIES POWERLEVELS',
     'MILITARYABILITIES POWERLEVELS, MILITARYABILITIES POWERLEVELS, MILITARYABILITIES POWERLEVELS',
     'MILITARYABILITIES POWERLEVELS, MILITARYABILITIES POWERLEVELS, MILITARYABILITIES POWERLEVELS, MILITARYABILITIES POWERLEVELS',
 ];
 
 rule_set['SOCIALALIGNMENT'] = [
         'Lawful good',
         'Lawful neutral',
         'Lawful evil',
         'Neutral evil',
         'True neutral',
         'Neutral good',
         'Chaotic good',
         'Chaotic netutral',
         'Chaotic evil'
 ];
 
 rule_set['LEVELS'] = [
     'High',
     'Medium',
     'Low'
 ];
 
 
 rule_set['AREATYPES'] = [
     'Badlands',
     'Wastes',
     'Expanse',
     'Barrens',
     'Plains',
     'Field',
     'Flats',
     'Range',
     'Territory',
     'Ashlands',
     'Basin'
 ];
 
 
 rule_set['AREAPREFIX'] = [
     'Sparse',
     'Western',
     'Eastern',
     'Northern',
     'Southern',
     'Searing',
     'Thermo',
     'Boiling',
     'Parching',
     'Raving',
     'Branded',
     'Great',
     'Blasted',
     'Scorching'
 ];
 
 
 
 rule_set['AREANAMES'] = [
     '[AREAPREFIX ]AREATYPES',
     'The [AREAPREFIX ]AREATYPES',
 ];
 
 rule_set['POPULATIONLEVELS'] = [
     'Low',
     'High', 
     'Sparse',
     'Average'
 ];
 
 rule_set['SUBSISTENCESYSTEM'] = [
     'Foraging',
     'Herding',
     'Farming',
     'Trading',
 ];
 
 rule_set['TERRAIN'] = [
     'Canyon',
     'Glacier',
     'Hills',
     'Badlands',
     'Valley',
     'Mountain',
     'Desert',
     'Forest',
     'Plains',
     'Ocean',
     'River',
     'Swamp',
     'Artic',
     'Coastal',
     'Jungle',
     'Treacherous',
     'Rainforest',
     'Croplands',
     'Grassland',
     'Tundra',
     'Underground',
     'Urban',
     'Marsh',
     'Volcanic'
 ];
 
 rule_set['CLIMATE'] = [
     'Arctic', 
     'Arid', 
     'Other', 
     'Subtropical', 
     'Temperate', 
     'Tropical',
 ];
 
 rule_set['ORGANIZATIONNAME'] = [
     '[ORGANIZATIONNAMEPREFIX ]Woodland',
     '[ORGANIZATIONNAMEPREFIX ]Elder',
     '[ORGANIZATIONNAMEPREFIX ]Storm',
     '[ORGANIZATIONNAMEPREFIX ]Lord',
     '[ORGANIZATIONNAMEPREFIX ]Lady',
     '[ORGANIZATIONNAMEPREFIX ]Sand',
     '[ORGANIZATIONNAMEPREFIX ]Fire',
     '[ORGANIZATIONNAMEPREFIX ]Hallow',
     '[ORGANIZATIONNAMEPREFIX ]Land\'s',
     '[ORGANIZATIONNAMEPREFIX ]Shell',
     '[ORGANIZATIONNAMEPREFIX ]Foundry',
     '[ORGANIZATIONNAMEPREFIX ]Florist',
     '[ORGANIZATIONNAMEPREFIX ]Birchstone',
     '[ORGANIZATIONNAMEPREFIX ]Mountain',
     '[ORGANIZATIONNAMEPREFIX ]Hammer',
     '[ORGANIZATIONNAMEPREFIX ]Crusaders',
 
 ];
 
 rule_set['ORGANIZATIONNAMEPREFIX'] = [
     'Dusk',
     'Azure',
     'Crimson',
     'Emerald',
     'Silver',
     'Mystical'
 ];
 
 rule_set['ORGANIZATIONTYPE'] = [
     'Alliance',
     'Brotherhood',
     'Church',
     'Circle',
     'Clan',
     'Club',
     'Company',
     'Congregation',
     'Contingent',
     'Council',
     'Court',
     'Coven',
     'Cult',
     'Enclave',
     'Faction',
     'Group',
     'Guard',
     'Guild',
     'Institution',
     'League',
     'Organization',
     'Secret Society',
     'Society',
     'Syndicate',
     'Union',
     'Knighthood',
 ];
 
 rule_set['ORGANIZATIONSTRUCTURE'] = [
     'Hierarchical', 
     'Flat', 
     'Functional', 
     'Divisional', 
     'Matrix', 
     'Network',
     'Cellular'
 ];
 
 rule_set['URBANAREA'] = [
     'Precinct', 
     'Zone', 
     'Sector', 
     '[Merchant ]District', 
     'Borough', 
     'Ward', 
     'Neigborhood', 
     'Block', 
     'Quarter', 
     'Other', 
     'Travel Route'
 ];
 
 rule_set['WIND'] = [
    'Strong',  
    'Mild', 
    'Light',
    'None', 
    'Weak', 
    'WINDFORCE', 
    'Warm',
];
rule_set['WINDBLIZZARD'] = [
    'Strong',  
    'WINDFORCE', 
];
 
 
rule_set['WINDHIGH'] = [
    'Gale-Force',  
    'Violent', 
    'Strong', 
    'Blustery', 
    'Howling', 
    'Wild',
    'Gusts',
    'Tempest',
];
 
rule_set['WINDFORCE'] = [
    'Gale-Force', 
    'Squally', 
    'Violent', 
    'Strong', 
    'Blustery', 
    'Howling', 
    'Brisk', 
    'Bitter',
];
 
 let RULESET_LIST = [
 'ARMOR',
 'ARMORITEMS',
 'BARRELSMALL',
 'BLACKSSMITHITEMS',
 'BROADSWORD',
 'CHARMS',
 'CRAFTEDWEAPONS',
 'CRATEMEDIUM',
 'CRATESMALL',
 'CUTLASS',
 'DAGGER',
 'DRINKS',
 'DRUSUS',
 'FALCHION',
 'FLAIL',
 'JEWELERY',
 'KATANA',
 'KRYSS',
 'LARGESCALYTHINGS',
 'LARGEVALUE',
 'LONGSWORD',
 'MACE',
 'MATERIAL',
 'MEDIUMVALUE',
 'METAL',
 'NECKLACETYPES',
 'PLACESOFLEARNING',
 'PLATINUM',
 'SACKTYPE',
 'SCROLL',
 'SHIELD',
 'SHORTSWORD',
 'SMALLITEMS',
 'SMALLTOOL',
 'SMALLVALUE',
 'SMALLVALUEArtisan',
 'SMALLVALUEBlacksmith',
 'SMALLVALUEClergy',
 'SMALLVALUECraftsman',
 'SMALLVALUECriminal',
 'SMALLVALUEFarmer',
 'SMALLVALUEGarmentTrade',
 'SMALLVALUEMerc',
 'SMALLVALUEMerchant',
 'SMALLVALUEProfessionalSpecialties',
 'SMALLVALUESage',
 'SPEAR',
 'STORAGECONTAINER',
 'SWORD',
 'TOOLS',
 'TRADEGOODS',
 'TWOHANDEDSWORD',
 'VALUECARRIED',
 'VALUELARGE',
 'VALUEMEDIUM',
 'VALUESMALL',
 'WEAPONS',
 
 ];

 return rule_set;
}


 


}