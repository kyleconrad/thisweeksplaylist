// VIEWPORT BUGGYFILL
window.viewportUnitsBuggyfill.init();



$(document).ready(function() {

	// MOBILE & BROWSER TEST
	var isMobile = navigator.userAgent.match(/mobile/i);
	var isFirefox = /Firefox/.test(navigator.userAgent),
		isOpera = /Opera/.test(navigator.userAgent);
	if (!isMobile) {
		$('body').addClass('desktop');
	}

	// GET PAGE TITLE
	var pageTitle = document.title,
		songTitleLoaded = false;


	// POLYFILL FOR WEBKIT BACKGROUND TEXT CLIPPING
	var clipElement = document.querySelector('h2'),
		imgPath = $('h2').data('pattern');

	clipElement.backgroundClipPolyfill({
		'patternID': 'mypattern',
		'patternURL': imgPath,
		'class': 'date'
	});



	// BUILD LIST BASED ON JSON
	var musicList = [],
		song;

	buildList();

	function buildList() {
		$.getJSON( '/js/music.json', function( data ) {
			$.each( data, function( key, data ) {
				var titleEnd = data.substr(0, data.length-1);
				var titleBegin = titleEnd.substr(5);

				musicList.push( titleBegin );
			});

			$.each( musicList, function( key, data ) {
				var trackNum = leftPad(key+1, 2);

				$('#playlist').append( '<li audio="' + trackNum + '"><a href="#" class="song-link unplayed">' + trackNum + '. ' + data + '</a><div class="song-progress"></div></li>' );
			});

			$('.song-link').on('click', function(e){
				var songLine = $(this).parents('li');

				if (!$(this).hasClass('playing') && !songLine.siblings('li').children('.song-link').hasClass('playing')) {
					loadSong(songLine);
				}
				else if (!$(this).hasClass('playing') && songLine.siblings('li').children('.song-link').hasClass('playing')) {
					var otherSongs = songLine.siblings('li');

					song.pause();
					otherSongs.children('.song-progress').css('width', 0);
					otherSongs.children('.song-link').removeClass('playing paused').addClass('unplayed');

					loadSong(songLine);
				}
				
				song.play();

				songLine.siblings('li').children('.song-link').removeClass('playing paused');
				$(this).addClass('playing').removeClass('unplayed');

				if (!$(this).hasClass('paused') && song.currentTime > 0) {
					song.pause();
					$(this).addClass('paused');
				}
				else if ($(this).hasClass('paused') && song.currentTime > 0) {
					$(this).removeClass('paused');
				}

				return false;
			});
		});
	}
	function leftPad( number, targetLength ) {
	    var output = number + '';
	    while (output.length < targetLength) {
	        output = '0' + output;
	    }
	    return output;
	}



	// PLAYING AUDIO
	function loadSong(elem) {
		var url = elem.attr('audio'),
			progress = elem.children('.song-progress');

		document.title = elem.text() + ' \u00A0\xD7\u00A0 ' + pageTitle;

		song = new Audio('//cdn.thisweeksplaylist.co/tracks/' + url + '.mp3');

		song.addEventListener('timeupdate',function (){
			var current = song.currentTime,
				songLength = Math.round(song.duration);
			var songTime = (current/songLength) * 100;

			progress.css('width', songTime + '%');

			if (current >= song.duration && !elem.is(':last-child')) {
				elem.children('.song-link').removeClass('playing paused').addClass('unplayed');
				progress.css('width', 0);

				loadSong(elem.next('li'));
				song.play();
				elem.next('li').children('.song-link').addClass('playing').removeClass('unplayed');
			}
			else if (current >= song.duration && elem.is(':last-child')) {
				elem.children('.song-link').removeClass('playing paused').addClass('unplayed');
				progress.css('width', 0);

				document.title = pageTitle;
			}
		});
	}



	// KEYBOARD CONTROL OF AUDIO
	$(document).keypress(function(e) {
		if (e.keyCode == 32) {
			if ($('.song-link').hasClass('paused')) {
				song.play();
				$('.song-link').removeClass('paused');
			}
			else if ($('.song-link').hasClass('playing')) {
				song.pause();
				$('.playing').addClass('paused');
			}

			return false;
		}
	});
});