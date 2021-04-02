/******************************************
             Initialisation
******************************************/

const $ = require('jquery');
let otrQueryParams = {};
var sha256 = require('js-sha256');

import { watchFormatting, watchWordCount, initAutoscroll } from './texteditor';
import { inputSetup, getQueryParams , loadTebasURL, hide as inputHide } from './input';
import oldBrowserCheck from './old-browsers';
import languageSetup from './languages';
import { createPlayer, playerDrivers, getPlayer, isVideoFormat } from './player/player';
import { bindPlayerToUI, keyboardShortcutSetup } from './ui';
import { activateTimestamps, insertTimestamp, sendTebasTimestamp , convertTimestampToSeconds } from './timestamps';
import { initBackup } from './backup';
import { exportSetup } from './export';
import importSetup from './import';
import viewController from './view-controller';

export default function init(){
    initBackup();
    watchFormatting();
    languageSetup();
    activateTimestamps();
    exportSetup();
    importSetup();
    initAutoscroll();


    // this is necessary due to execCommand restrictions
    // see: http://stackoverflow.com/a/33321235
    window.insertTimestamp = insertTimestamp;
    window.sendTebasTimestamp = sendTebasTimestamp;

    keyboardShortcutSetup();

    viewController.set('editor');
	
	getPreviewURL();


	function getPreviewURL () {
		// He cambiado esta funcion para que coja la URL base de tebas de la URL que hace la llamada a Minutado, he modificado el Plugin para que envie baseURL en la llamada a minutado
		var url = new URL(window.location.href);
		const baseURL = url.searchParams.get("baseurl").split("&")[0];
		//console.log(url.searchParams.get("video"));
		const previewPath =baseURL+url.searchParams.get("video").split("..")[1];
		//console.log (previewPath);
		getMinutado();
		return previewPath;
	}

	function getMinutado(){

		var url = new URL(window.location.href);
		var baseurl = url.searchParams.get("baseurl");
		var ref = url.searchParams.get("ref");
		var metadata = url.searchParams.get("metadata");
		var query = "user=admin&function="+"get_resource_field_data&resource="+ref;
		var sign = sha256("cd66c09584b87c9fc7fbd6db4f0e1ac312c87f65cb3c39833fa1c2934047f098"+query).toString();
		var xhr = new XMLHttpRequest();
        xhr.open("GET", baseurl + "/api/?" + query + "&sign=" + sign, true);
        console.log(xhr.responseText);
		xhr.send(JSON.stringify({}));
		xhr.onload = function() {
			var json = JSON.parse(xhr.responseText);
			// console.log("Response JSON", json);
			var i;
			for(i = 0; i<json.length; i++){
				if(json[i].ref===metadata){
					document.getElementById('textbox').innerHTML= json[i].value;
				}
				activateTimestamps();
			}
		};
		xhr.onerror = function () {
			alert("Error");
		}
	}

    // Gather query parameters into an object
    otrQueryParams = getQueryParams();

    // If the ?v=<VIDEO_ID> parameter is found in the URL, auto load YouTube video
	const str = window.location.href.toString();
    if ( str.includes("video") ){
        $('.start').removeClass('ready');
        createPlayer({
            driver: playerDrivers.HTML5_VIDEO,
            source: getPreviewURL()
        }).then((player) => {
            inputHide();
            viewController.set('editor');
            bindPlayerToUI();
            let timestamp = otrQueryParams['t']; 
            if ( timestamp ){
                // Is the timestamp in HH:MM::SS format?
                if ( ~timestamp.indexOf(":") ){
                    timestamp = convertTimestampToSeconds(timestamp);
                } 
                player.driver._ytEl.seekTo(timestamp);
            }
        });

    } else {

        if ( localStorageManager.getItem("oT-lastfile") ) {
            viewController.set('editor');
        }
        
    }

    $('.title').mousedown(() => {
        if (viewController.is('about')) {
            viewController.set('editor');
        } else {
            viewController.set('about');
        }
    });
    $('.settings-button').mousedown(() => {
        if (viewController.is('settings')) {
            viewController.set('editor');
        } else {
            viewController.set('settings');
        }
    });

}

// note: this function may run multiple times
function onLocalized() {
    const resetInput = inputSetup({
        create: file => {
            const driver = isVideoFormat(file) ? playerDrivers.HTML5_VIDEO : playerDrivers.HTML5_AUDIO;
		    createPlayer({
		        driver: driver,
		        source: window.URL.createObjectURL(file),
                name: file.name
		    }).then(() => {
                bindPlayerToUI(file.name);
		    });
        },
        createFromURL: url => {
		    createPlayer({
		        driver: playerDrivers.HTML5_VIDEO,
		        source: url
		    }).then(() => {
                bindPlayerToUI();
		    });
        }
    });

    watchWordCount();

    var startText = document.webL10n.get('start-ready');
    $('.start')
        // .addClass('ready')
        .toggleClass('ready', !otrQueryParams.v)    // Show 'Loading...' text if a video is to be automatically initialized
        .off()
        .click(() => {
            viewController.set('editor');
        });
    
    $('.reset').off().on('click', () => {
        const player = getPlayer();
        resetInput();
        if (player) {
            player.destroy();
        }
    });
    
    oldBrowserCheck();
    // oT.input.loadPreviousFileDetails();
}

window.addEventListener('localized', onLocalized, false);

$(window).resize(function() {
    if (document.getElementById('media') ) {
        document.getElementById('media').style.width = oT.media.videoWidth();
    }
});

