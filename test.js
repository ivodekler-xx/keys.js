var myKL = new keyListener;

console.log(myKL);

function keyDef(){
	var keyName = prompt('type the name of your key here');
	var kC = keyCodes[keyName];
	console.log(typeof(kC));
	if(typeof(kC) == 'number'){
		var pr = prompt('Message when pressing key');
		var wp = prompt('Message when keeping key pressed');
		var rl = prompt('Message when releasing key');
		return {keyCode: kC, 
				press: function(){console.log(pr);}, 
				whilePressed: {run: function(){console.log(wp);},interval: 150},
				release: function(){console.log(rl)}};
	}
	return false
};

myKey = myKL.addKey({
	keyCode: 13,
	release: function(){
		var nK = new keyDef();
		if(nK) myKL.addKey(nK);
	}
});