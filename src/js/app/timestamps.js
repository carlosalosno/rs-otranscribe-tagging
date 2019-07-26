import {getPlayer} from './player/player';
var sha256 = require('js-sha256');
function getTime(){
    // get timestamp
    const player = getPlayer();
    let time = 0;
    if (player) {
        time = player.getTime();
    }

    return {
        formatted: formatMilliseconds(time),
        raw: time
    };
};

function formatMilliseconds(time) {
    const hours = Math.floor(time / 3600).toString();
    const minutes = ("0" + Math.floor(time / 60) % 60).slice(-2);
    const seconds = ("0" + Math.floor( time % 60 )).slice(-2);
    let formatted = minutes+":"+seconds;
    if (hours !== '0') {
        formatted = hours + ":" + minutes + ":" + seconds;
    }
    formatted = formatted.replace(/\s/g,'');
    return formatted;
}

// http://stackoverflow.com/a/25943182
function insertHTML(newElement) {
    var sel, range;
    if (window.getSelection && (sel = window.getSelection()).rangeCount) {
        range = sel.getRangeAt(0);
        range.collapse(true);
        range.insertNode(newElement);

        // Move the caret immediately after the inserted span
        range.setStartAfter(newElement);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}


function insertTimestamp(){
    var time = getTime();
    if (time) {
        const space = document.createTextNode("\u00A0");
        insertHTML(createTimestampEl(time));
        insertHTML(space);
        activateTimestamps();
    }
}

function sendTebasTimestamp(){
    var textBoxContent = document.getElementById('textbox').innerHTML;
	var url = new URL(window.location.href);
	var ref = url.searchParams.get("ref");
	var metadata = url.searchParams.get("metadata");
	console.log('Ref: '+ref );
	console.log('Metadata: '+metadata );
	console.log('Contenido: '+encodeURIComponent(textBoxContent));
	var query = "user=admin&function="+"update_field&param1="+ref+"&param2="+metadata+"&param3="+encodeURIComponent(textBoxContent)+"&param4=";
	//console.log('Test envío: '+ "3f72166c57c0c6f7998425dadf5efacf4543964861089ee61863530d12b46b21"+query);
	var sign = sha256("3f72166c57c0c6f7998425dadf5efacf4543964861089ee61863530d12b46b21"+query).toString();
	//console.log("SHA = "+ sign);
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://trunk.tebascms.com/api/?"+query+"&sign="+sign, true);
	
	xhr.send(JSON.stringify({
	}));
	xhr.onload = function() {
		alert("Tebas sync complete!");
	};
	xhr.onerror = function () {
		alert("Tebas sync failed!");
	}
}

// function sendTebasTimestamp(){
    // var textBoxContent = document.getElementById('textbox').innerHTML;
	// var url = new URL(window.location.href);
	// var ref = url.searchParams.get("ref");
	// console.log(ref);
	// var resCode = ref.split("?")[0];
	// console.log(resCode);
	// var metadata = url.searchParams.get("metadata");
	// var metadataCode = metadata.split("?")[0];
	// console.log('Test envío: '+resCode );
	// console.log('Test envío: '+metadataCode );
	// var query = "user=admin&function="+"update_field&param1="+resCode+"&param2="+metadataCode+"&param3="+encodeURIComponent(textBoxContent)+"&param4=";
	// console.log('Test envío: '+ "3f72166c57c0c6f7998425dadf5efacf4543964861089ee61863530d12b46b21"+query);
	// var sign = sha256("3f72166c57c0c6f7998425dadf5efacf4543964861089ee61863530d12b46b21"+query).toString();
	// console.log("SHA = "+ sign);
	// var xhr = new XMLHttpRequest();
	// xhr.open("GET", "http://trunk.tebascms.com/api/?"+query+"&sign="+sign, true);
	
	// xhr.send(JSON.stringify({
	// }));
	// xhr.onload = function() {
		// alert("Tebas sync complete!");
	// };
	// xhr.onerror = function () {
		// alert("Tebas sync failed!");
	// }
// }



function createTimestampEl(time) {
    const timestamp = document.createElement('span');
    timestamp.innerText = time.formatted;
    timestamp.className = 'timestamp';
    timestamp.setAttribute('contenteditable', 'false');
    timestamp.setAttribute('data-timestamp', time.raw);
    return timestamp;
}

function activateTimestamps(){
    Array.from(document.querySelectorAll('.timestamp')).forEach(el => {
        el.contentEditable = false;
        el.removeEventListener('click', onClick);
        el.addEventListener('click', onClick);
    });
}

function onClick() {
    const player = getPlayer();
    var time = this.dataset.timestamp;
    if (player) {
        if (typeof time === 'string' && time.indexOf(':') > -1) {
            // backwards compatibility, as old timestamps have string rather than number
            player.setTime(convertTimestampToSeconds(time));
        } else {
            player.setTime( time );
        }
    }    
}

// backwards compatibility, as old timestamps use setFromTimestamp() and ts.setFrom()
window.setFromTimestamp = function(clickts, element){
    window.ts.setFrom(clickts, element);
}
window.ts = {
    setFrom: function(clickts, element){
        const player = getPlayer();
        var time = this.dataset.timestamp;
        if (player && element.childNodes.length == 1) {
            player.setTime( convertTimestampToSeconds(time) );
        }
    }
}

function convertTimestampToSeconds(hms) {
    var a = hms.split(':');
    if (a.length === 3) {
        return ((+a[0]) * 60 * 60) + (+a[1]) * 60 + (+a[2]);
    }
    return (+a[0]) * 60 + (+a[1]);
}

export {activateTimestamps, insertTimestamp, sendTebasTimestamp, convertTimestampToSeconds, formatMilliseconds};