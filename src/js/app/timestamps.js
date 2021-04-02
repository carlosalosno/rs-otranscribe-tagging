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

// function formatMilliseconds(time) {
    // const hours = Math.floor(time / 3600).toString();
    // const minutes = ("0" + Math.floor(time / 60) % 60).slice(-2);
    // const seconds = ("0" + Math.floor( time % 60 )).slice(-2);
    // let formatted = minutes+":"+seconds;
    // if (hours !== '0') {
        // formatted = hours + ":" + minutes + ":" + seconds;
    // }
    // formatted = formatted.replace(/\s/g,'');
    // return formatted;
// }

function formatMilliseconds(time) {
        //alert(milliseconds);
        var h = Math.floor(time / 3600);
        time = time - h * 3600;
        var m = Math.floor(time / 60);
        time = time - m * 60;
        var s = Math.floor(time);
        time = time - s;
        var f = Math.floor((time * 1000) / 40);
        // Check if we need to show hours
        h = (h < 10) ? ("0" + h) + ":" : h + ":";
        // If hours are showing, we may need to add a leading zero. Always show at least one digit of minutes.
        m = (((h) && m < 10) ? "0" + m : m) + ":";
        // Check if leading zero is need for seconds
        s = ((s < 10) ? "0" + s : s) + ":";
        f = (f < 10) ? "0" + f : f;
        return h + m + s + f;
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
	// document.getElementById('loader').style.display="block";
    var textBoxContent = document.getElementById('textbox').innerHTML;
	var url = new URL(window.location.href);
	var baseurl = url.searchParams.get("baseurl");
	var ref = url.searchParams.get("ref");
	var metadata = url.searchParams.get("metadata");
	var query = "user=admin&function=" + "update_field&resource=" + ref + "&field=" + metadata + "&value=" + encodeURIComponent(textBoxContent);
    var sign = sha256("cd66c09584b87c9fc7fbd6db4f0e1ac312c87f65cb3c39833fa1c2934047f098" + query).toString();
       //console.log('Test envío: '+ baseurl + query + "&sign=" + sign);
	var xhr = new XMLHttpRequest();
	var data = new FormData();
	data.append('user', 'admin');
    // data.append('query', query + "&sign=" + sign);
    data.append('query', query);
	data.append('sign', sign);
	xhr.open("POST", baseurl + "/api/", true);
	//Send the proper header information along with the request
	// xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.send(data);
	xhr.onload = function() {
		// document.getElementById('loader').style.display="none";
		alert("Tebas sync complete!");
	};
	xhr.onerror = function () {
		// document.getElementById('loader').style.display="none";
		alert("Tebas sync failed!");
	}
}


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
	console.log(a);
    if (a.length === 3) {
        return ((+a[0]) * 60 * 60) + (+a[1]) * 60 + (+a[2]);
    }
    return (+a[0]) * 60 + (+a[1]);
}

// function convertTimestampToSeconds(hms) {
    // var a = hms.split(':');
	// console.log(a);
    // if (a.length === 3) {
        // return ((+a[0]) * 60 * 60) + (+a[1]) * 60 + (+a[2]);
    // }
    // return (+a[0]) * 60 + (+a[1]);
// }

function convertTimestampToSeconds(hms) {
    var a = hms.split(':');
        return ((+a[0]) * 60 * 60) + (+a[1]) * 60 + (+a[2]) + (+a[3]) * 0.04;

}

export {activateTimestamps, insertTimestamp, sendTebasTimestamp, convertTimestampToSeconds, formatMilliseconds};
