function setCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function removeCookie(name) {setCookie(name,"",-1);}

function insertAtCaret(txtarea, text) {
	var scrollPos = txtarea.scrollTop;
	var strPos = 0;
	var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? "ff" : (document.selection ? "ie" : false ) );

	if (br == "ie") {
		txtarea.focus();
		var range = document.selection.createRange();
		range.moveStart('character', -txtarea.value.length);
		strPos = range.text.length;
	} else if (br == "ff") strPos = txtarea.selectionStart;

	var front = (txtarea.value).substring(0, strPos);
	var back = (txtarea.value).substring(strPos, txtarea.value.length);
	txtarea.value = front + text + back;
	strPos = strPos + text.length;

	if (br == "ie") {
		txtarea.focus();
		var range = document.selection.createRange();
		range.moveStart('character', -txtarea.value.length);
		range.moveStart('character', strPos);
		range.moveEnd('character', 0);
		range.select();
	} else if (br == "ff") {
		txtarea.selectionStart = strPos;
		txtarea.selectionEnd = strPos;
		txtarea.focus();
	}
	txtarea.scrollTop = scrollPos;
}

var Transcript = (function () {
	var _this = this;
	this.makeTranscription = function() {
		_this.transcriptedHTML = '<span>';
		_this.sourceHTML = '<span>'

		var source = _this.codeSource.attr('value');

		for (var i=0; i < source.length ; i++){
			if (source[i].charCodeAt()==10){ // if Enter - replace to <br/>
				_this.transcriptedHTML += '</span><br/><span>';
				_this.sourceHTML += '</span><br/><span>';
				continue;
			}
			if ( !(/[\s".,:!@#$%^&*\(\)]/.test(source[i])) ){ // if not letter - skip step
				var transctiptRule = _this.rules[source[i]]; // get specific rule

				if (!transctiptRule) {
					_this.transcriptedHTML += source[i];
					_this.sourceHTML += source[i];
				}
				else {
					while (transctiptRule[source[i+1]]){
						_this.sourceHTML += source[i];
						transctiptRule = transctiptRule[source[i+1]];
						i++;
					}
					if (transctiptRule.also) {
						_this.transcriptedHTML += '<em title="'+ transctiptRule.also +'" >'+ transctiptRule.def +'</em>';
						_this.sourceHTML += source[i];
					}
					else {//&# 8203; - make word wrap;
						_this.transcriptedHTML += (transctiptRule.def||transctiptRule)+'&#8203;';
						_this.sourceHTML += source[i];
					}
				}
			} else { //&# 8203; - make word wrap;
				_this.transcriptedHTML += '</span>' + source[i] +'<span>';   
				_this.sourceHTML += '</span>' + source[i] +'<span>';
			}
		}
		_this.transcriptedHTML += '</span>';
		_this.sourceHTML += '</span>'

		_this.displayResult();
	};

	this.displayResult = function() {
		this.transcriptinOutput.html (this.transcriptedHTML);

		this.transcriptinOutput.find('span')
				.bind('mouseenter',function(){_this.sourceOutput.find('span:eq('+ _this.transcriptinOutput.find('span').index(this) +')').addClass('active');})
				.bind('mouseleave',function(){_this.sourceOutput.find('span:eq('+ _this.transcriptinOutput.find('span').index(this) +')').removeClass('active');});

		this.sourceOutput.html (this.sourceHTML);
	};

	/**
	 *  initial function
	 */
	this.init = function(codeSource, transcriptinOutput, sourceOutput) {
		this.codeSource = codeSource;
		this.transcriptinOutput = transcriptinOutput;
		this.sourceOutput = sourceOutput;

		this.codeSource.bind('keyup', this.makeTranscription);
		$.ajax({
			url: "rule.json",
			dataType: "json",
			success: function(rules){ _this.rules = rules; }
		});
	};

	return this;
})();

var keyboard = {
	keyboardList:[
		{
			name: 'Хіраґана',
			keyArray : ['っ','ゃ','ん','わ','ら','や','ま','は','な','た','さ','か','あ','。',' ',' ','ゐ','り',' ','み','ひ','に','ち','し','き','い','、','ゅ',' ',' ','る','ゆ','む','ふ','ぬ','つ','す','く','う',' ',' ',' ','ゑ','れ',' ','め','へ','ね','て','せ','け','え',' ','ょ',' ','を','ろ','よ','も','ほ','の','と','そ','こ','お'],
			keySubArray: ['ぱ','ば','だ','ざ','が','ぴ','び','ぢ','じ','ぎ','ぷ','ぶ','づ','ず','ぐ','ぺ','べ','で','ぜ','げ','ぽ','ぼ','ど','ぞ','ご']
		},
		{
			name: 'Катакана',
			keySubArray: ['パ','バ','ダ','ザ','ガ','ピ','ビ','ヂ','ジ','ギ','プ','ブ','ヅ','ズ','グ','ペ','ベ','デ','ゼ','ゲ','ポ','ボ','ド','ゾ','ゴ'],
			keyArray : ['ァ','ャ','ン','ワ','ラ','ヤ','マ','ハ','ナ','タ','サ','カ','ア','ィ',' ','ッ','ヰ','リ',' ','ミ','ヒ','ニ','チ','シ','キ','イ','ヴ','ュ','。',' ','ル','ユ','ム','フ','ヌ','ツ','ス','ク','ウ','ェ',' ','、','ヱ','レ',' ','メ','ヘ','ネ','テ','セ','ケ','エ','ォ','ョ','ー','ヲ','ロ','ヨ','モ','ホ','ノ','ト','ソ','コ','オ']

		}
	],
	container : $('#keyboard'),
	enterKey : function (/*Event*/e){
		if (e.target.childNodes.length == [1]){
			insertAtCaret(Transcript.codeSource[0], e.target.firstChild.nodeValue);
			Transcript.makeTranscription();
		}
	},
	
	setKeyboardLayout : function (index){setCookie('keybourdLayout',index);},
	getKeyboardLayout : function (){this.keybourdLayout = this.keyboardList[getCookie('keybourdLayout')||0];},

	keySwitcherInit : function(){
		this.container.append('<div id="keySwitch"><h4 class="f-right">Переключити клавіатуру:</h4></div>');
		var keyLayerContainer = $('#keySwitch');

		for (var i=0; i < this.keyboardList.length ;i++) keyLayerContainer.append('<a href="#" class="'+(this.keybourdLayout == this.keyboardList[i]?'active':'') +'" item="'+i+'">'+ this.keyboardList[i].name +'</a>')
			keyLayerContainer.bind('click',function(e){
				e.stopPropagation();
				if (e.target.tagName=='A' && e.target.innerHTML != keyboard.keybourdLayout.name){
					keyboard.setKeyboardLayout (e.target.getAttribute('item'));
					keyboard.init();
				}
			})
	},
	init : function(){
		this.getKeyboardLayout();
		this.container.html('');

		this.container.append('<div class="main-keyboard"></div>');
		for (var i =0 ; i<this.keybourdLayout.keyArray.length;i++ ){this.container.find('.main-keyboard').append('<div>'+this.keybourdLayout.keyArray[i]+'</div>');}

		this.container.append('<div class="sub-keyboard"></div>');
		for (var i =0 ; i<this.keybourdLayout.keySubArray.length;i++ ){this.container.find('.sub-keyboard').append('<div>'+this.keybourdLayout.keySubArray[i]+'</div>');}

		this.container.bind('click', this.enterKey);
		this.keySwitcherInit();

	}
}

$(document).ready(function() {
	console.log($('#editSection textarea'), $('#resultSection'), $('.highlite:first'));
	Transcript.init($('textarea'), $('#resultSection'), $('.highlite:first'));
//	keyboard.init();
//	$('#makeTranscription').bind('click', Transcript.makeTranscription);
});
