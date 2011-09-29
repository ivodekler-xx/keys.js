var keyListeners = [] , listening = true, setKey, lastpressed;              //only features to do: change key, remove key

if (!window.console) window.console = {log:function(){}};

var keyCodes = [], keyNames = [];

var getKeyCode = function(keyname){
	if(typeof keyname === 'string'){
		if(keyCodes[keyname]){return keyCodes[keyname];} else {module.log('specified key not found'); return 0;}
	}
	return 0;
};

var getKeyName = function(keycode){
	if(keyNames[keycode]){return keyNames[keycode];} else {module.log('specified key not named'); return 'any';}
};

var keyListener = function(name,settings){
	var kL = this;
	this.name = name || 'a KeyListener';
	var index = keyListeners.length;
	if(!settings) settings = {};
	var enabled = settings.enabled || true,
       logging = settings.logging || true;
	keyListeners.push(kL);
	var usedKeys = [],
		pressedKeys = [];
	function addKey(keyInfo){
		var newKey = new key(keyInfo);
		if(newKey.keyCode){
			usedKeys[newKey.keyCode] = newKey;
		} else {
			listening = false;
			setKey = function(keyCode){
				newKey.keyCode = keyCode;
			};
		}
		return newKey;
	};
	function removeListener(){
		keyListeners.splice(index,1);
		var len = keyListeners.length;
		while(len-index){
			keyListeners[index].lowerIndex();
			index++;
		}
	};
	function key(keyInfo){
      if (kL.logging) console.log(keyInfo,'created in '+ kL.name);
		var k = this, descr = keyInfo.descr || null,
          keyCode = keyInfo.keyCode ? keyInfo.keyCode : keyInfo.keyName ? keyCodes[keyInfo.keyName] : false,
          pressed = false, timeOut, _whilePressed,
          _press   = keyInfo.press  ? keyInfo.press : null,
          _release = keyInfo.release ? keyInfo.release : null;
      if(keyInfo.whilePressed){
         if(typeof keyInfo.whilePressed == 'function'){
            _whilePressed = {run: keyInfo.whilePressed, interval: 1000 };
         }else if(typeof keyInfo.whilePressed == 'object' && keyInfo.whilePressed.run && keyInfo.whilePressed.interval ){
            _whilePressed = {run: keyInfo.whilePressed.run, interval: keyInfo.whilePressed.interval };
         }
      }
		function press(){
         if(pressed == false){
         kL.pressedKeys.push(keyCode);
            if(_press) _press();
            pressed = true;
            if(_whilePressed) {
               timeOut = setTimeout(function() {
                  _whilePressed.run();
                  if (pressed){
                     timeOut = setTimeout(arguments.callee, _whilePressed.interval);
                  }
               }, _whilePressed.interval);
            }
         }
		};
		function release(){
         pressed = false;
         if(timeOut) clearTimeout(timeOut);
         if(_release) _release();
		};
		this.__defineGetter__('keyCode',function(){return keyCode;});
		this.__defineGetter__('keyName',function(){return keyNames[keyCode];});
		this.__defineGetter__('descr',  function(){return descr;});
		this.__defineGetter__('press',  function(){ return press; });
		this.__defineGetter__('release',function(){ return release; });
		this.__defineGetter__('pressed',function(){ return pressed; });
      this.__defineGetter__('whilePressed', function(){ return {run: _whilePressed.run, interval: _whilePressed.interval}; });
      
      this.__defineSetter__('keyCode',function(value){
			if(usedKeys[keyCode] && usedKeys[keyCode].keyCode != value){	//old value exists and has to be removed
				delete usedKeys[keyCode];
			}
			keyCode = value;
			usedKeys[keyCode] = k;
			return keyCode;
		});
      this.__defineSetter__('keyName',function(value){
			if(keyCodes[value]) return keyCode = keyCodes[value];
			return false;
		});
      this.__defineGetter__('change', function(){
         listening = false;
         setKey = function(kC){
            if(kL.logging) console.log('changing '+keyNames[keyCode]+ ' key to '+keyNames[kC]);
            k.keyCode = kC;
         };
      });
      this.__defineGetter__('remove', function(){ if(keyCode) if(usedKeys[keyCode]) delete usedKeys[keyCode]; });
      
      this.__defineSetter__('press',  function(func) {
         if(typeof func == 'function') _press = func;
      });
      this.__defineSetter__('release',function(func) {
         if(typeof func == 'function') _release = func;
      });
      this.__defineSetter__('whilePressed', function(input){
         if(typeof input == 'function') {
            if(!_whilePressed){
               _whilePressed = {interval: 1000};
            }
            _whilePressed.run = input;
            
         }
         else if( typeof input == 'object' && input.run && input.interval)
         {
            _whilePressed = input;
         }
      });
	};
	function enable(){ enabled = true; };
	function disable(){ enabled = false; };
	function lowerIndex(){index--;};
	this.__defineGetter__('remove',function(){return removeListener});
	this.__defineGetter__('lowerIndex',function(){return lowerIndex;});
	this.__defineGetter__('usedKeys',function(){return usedKeys;});
	this.__defineGetter__('pressedKeys',function(){return pressedKeys;});
	this.__defineGetter__('addKey',function(){return addKey;});
	this.__defineGetter__('enabled',function(){return enabled});
	this.__defineGetter__('enable',function(){return enable});
	this.__defineGetter__('disable',function(){return disable});
   this.__defineGetter__('logging',function(){return logging});
   this.__defineSetter__('logging',function( bool ){ if( typeof bool == 'boolean' ) logging = bool; });
};

document.onkeydown = function(event){
  var keyCode = event.keyCode;
  if(listening == true){
	var i = keyListeners.length,
	theKeyListener;
	while(i--){
		theKeyListener = keyListeners[i]
		if(theKeyListener.logging && event.keyCode != lastpressed){
			console.log(event.keyCode+' - '+keyNames[event.keyCode]);
			lastpressed = event.keyCode;
		}
		if(theKeyListener.enabled){
		  var usedKeys = theKeyListener.usedKeys;
		  if(usedKeys[keyCode]) {
			event.preventDefault()
			theKeyListener.usedKeys[keyCode].press();
		  }
		}
	}
  }
};

document.onkeyup = function(event){
  var keyCode = event.keyCode;
  if(listening == true){
	var theKeyListener;
	var i = keyListeners.length;
	while(i--){
	      if(keyListeners[i].enabled){
			theKeyListener = keyListeners[i];
		      var usedKeys = theKeyListener.usedKeys;
		      if(usedKeys[keyCode]) {
			usedKeys[keyCode].release();
			var j = theKeyListener.usedKeys.length;
			while(j--){
				if(theKeyListener.pressedKeys[j] == keyCode){
					theKeyListener.pressedKeys.splice(j,1);
				}
			}
		      }
	      }
	}
  }else{
	if(setKey){
		setKey(keyCode);
		listening = true;
		setKey = null;
	}
  }
};

keyCodes['backspace'] = 8;
keyCodes['tab'] = 9;
keyCodes['enter'] = 13;
keyCodes['shift'] = 16;
keyCodes['ctrl'] = 17;
keyCodes['alt'] = 18;
keyCodes['pause'] = 19;
keyCodes['capslock'] = 20;
keyCodes['escape'] = 27;
keyCodes['space'] = 32;
keyCodes['pageup'] = 33;
keyCodes['pagedn'] = 34;
keyCodes['end'] = 35;
keyCodes['home'] = 36;
keyCodes['left'] = 37;
keyCodes['up'] = 38;
keyCodes['right'] = 39;
keyCodes['down'] = 40;
keyCodes['prtscrn'] = 44;
keyCodes['insert'] = 45;
keyCodes['delete'] = 46;
keyCodes['0'] = 48;
keyCodes['1'] = 49;
keyCodes['2'] = 50;
keyCodes['3'] = 51;
keyCodes['4'] = 52;
keyCodes['5'] = 53;
keyCodes['6'] = 54;
keyCodes['7'] = 55;
keyCodes['8'] = 56;
keyCodes['9'] = 57;
keyCodes['semicolon'] = 59;
keyCodes['a'] = 65;
keyCodes['b'] = 66;
keyCodes['c'] = 67;
keyCodes['d'] = 68;
keyCodes['e'] = 69;
keyCodes['f'] = 70;
keyCodes['g'] = 71;
keyCodes['h'] = 72;
keyCodes['i'] = 73;
keyCodes['j'] = 74;
keyCodes['k'] = 75;
keyCodes['l'] = 76;
keyCodes['m'] = 77;
keyCodes['n'] = 78;
keyCodes['o'] = 79;
keyCodes['p'] = 80;
keyCodes['q'] = 81;
keyCodes['r'] = 82;
keyCodes['s'] = 83;
keyCodes['t'] = 84;
keyCodes['u'] = 85;
keyCodes['v'] = 86;
keyCodes['w'] = 87;
keyCodes['x'] = 88;
keyCodes['y'] = 89;
keyCodes['z'] = 90;
keyCodes['windowsl'] = 91;
keyCodes['windowsr'] = 92;
keyCodes['select'] = 93;
keyCodes['num0'] = 96;
keyCodes['num1'] = 97;
keyCodes['num2'] = 98;
keyCodes['num3'] = 99;
keyCodes['num4'] = 100;
keyCodes['num5'] = 101;
keyCodes['num6'] = 102;
keyCodes['num7'] = 103;
keyCodes['num8'] = 104;
keyCodes['num9'] = 105;
keyCodes['multiply'] = 106;
keyCodes['add'] = 107;
keyCodes['subtract'] = 109;
keyCodes['decimalpoint'] = 110;
keyCodes['divide'] = 111;
keyCodes['f1'] = 112;
keyCodes['f2'] = 113;
keyCodes['f3'] = 114;
keyCodes['f4'] = 115;
keyCodes['f5'] = 116;
keyCodes['f6'] = 117;
keyCodes['f7'] = 118;
keyCodes['f8'] = 119;
keyCodes['f9'] = 120;
keyCodes['f10'] = 121;
keyCodes['f11'] = 122;
keyCodes['f12'] = 123;
keyCodes['tilde'] = 129
keyCodes['numlock'] = 144;
keyCodes['scrolllock'] = 145;
keyCodes['semi-colon'] = 146;
keyCodes['equal'] = 187;
keyCodes['comma'] = 188;
keyCodes['dash'] = 189;
keyCodes['period'] = 190;
keyCodes['forwardslash'] = 191;
keyCodes['backslash'] = 120;
keyCodes['open bracket'] = 219;
keyCodes['close bracket'] = 221;
keyCodes['single quote'] = 222;

keyNames['8'] = 'backspace';
keyNames['9'] = 'tab';
keyNames['13'] = 'enter';
keyNames['16'] = 'shift';
keyNames['17'] = 'ctrl';
keyNames['18'] = 'alt';
keyNames['19'] = 'pause';
keyNames['20'] = 'capslock';
keyNames['27'] = 'escape';
keyNames['32'] = 'space';
keyNames['33'] = 'pageup';
keyNames['34'] = 'pagedn';
keyNames['35'] = 'end';
keyNames['36'] = 'home';
keyNames['37'] = 'left';
keyNames['38'] = 'up';
keyNames['39'] = 'right';
keyNames['40'] = 'down';
keyNames['44'] = 'prtscrn';
keyNames['45'] = 'insert';
keyNames['46'] = 'delete';
keyNames['48'] = '0';
keyNames['49'] = '1';
keyNames['50'] = '2';
keyNames['51'] = '3';
keyNames['52'] = '4';
keyNames['53'] = '5';
keyNames['54'] = '6';
keyNames['55'] = '7';
keyNames['56'] = '8';
keyNames['57'] = '9';
keyNames['59'] = 'semicolon';
keyNames['65'] = 'a';
keyNames['66'] = 'b';
keyNames['67'] = 'c';
keyNames['68'] = 'd';
keyNames['69'] = 'e';
keyNames['70'] = 'f';
keyNames['71'] = 'g';
keyNames['72'] = 'h';
keyNames['73'] = 'i';
keyNames['74'] = 'j';
keyNames['75'] = 'k';
keyNames['76'] = 'l';
keyNames['77'] = 'm';
keyNames['78'] = 'n';
keyNames['79'] = 'o';
keyNames['80'] = 'p';
keyNames['81'] = 'q';
keyNames['82'] = 'r';
keyNames['83'] = 's';
keyNames['84'] = 't';
keyNames['85'] = 'u';
keyNames['86'] = 'v';
keyNames['87'] = 'w';
keyNames['88'] = 'x';
keyNames['89'] = 'y';
keyNames['90'] = 'z';
keyNames['91'] = 'windowsl';
keyNames['92'] = 'windowsr';
keyNames['93'] = 'select';
keyNames['96'] = 'num0';
keyNames['97'] = 'num1';
keyNames['98'] = 'num2';
keyNames['99'] = 'num3';
keyNames['100'] = 'num4';
keyNames['101'] = 'num5';
keyNames['102'] = 'num6';
keyNames['103'] = 'num7';
keyNames['104'] = 'num8';
keyNames['105'] = 'num9';
keyNames['106'] = 'multiply';
keyNames['107'] = 'add';
keyNames['109'] = 'subtract';
keyNames['110'] = 'decimalpoint';
keyNames['111'] = 'divide';
keyNames['112'] = 'f1';
keyNames['113'] = 'f2';
keyNames['114'] = 'f3';
keyNames['115'] = 'f4';
keyNames['116'] = 'f5';
keyNames['117'] = 'f6';
keyNames['118'] = 'f7';
keyNames['119'] = 'f8';
keyNames['120'] = 'f9';
keyNames['121'] = 'f10';
keyNames['122'] = 'f11';
keyNames['123'] = 'f12';
keyNames['144'] = 'numlock';
keyNames['145'] = 'scrolllock';
keyNames['146'] = 'semi-colon';
keyNames['187'] = 'equal';
keyNames['188'] = 'comma';
keyNames['189'] = 'dash';
keyNames['190'] = 'period';
keyNames['191'] = 'forwardslash';
keyNames['192'] = 'tilde';
keyNames['219'] = 'openbracket';
//keyNames['193'] = 'closebracket';
keyNames['220'] = 'backslash';
keyNames['221'] = 'closebracket';
keyNames['222'] = 'quote';