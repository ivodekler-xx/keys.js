//creates a key event for every key in the list that logs its name and code
//supposing you already created myKL = new KkyListener();

var i = 1, keyboard = [];

while(i<223){
	if(keyNames[i]){
		keyboard[i] = myKL.addKey({
			keyCode: i,
			release: function(){
				console.log(keyNames[this.keyCode],'-',this.keyCode);
			}
		})
	}
	i++;
}