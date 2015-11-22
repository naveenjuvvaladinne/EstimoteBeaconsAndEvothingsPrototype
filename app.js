var app = (function() {
	var app = {},
		roomBeacon,
		updateTimer = null,
		inRoom = false;

	app.initialize = function() {
		document.addEventListener("deviceready", function() {
			evothings.scriptsLoaded(onDeviceReady);
		}, false);
	};

	function onDeviceReady() {
		startScan();

		$("#in-room").html("Out of room!");

		updateTimer = setInterval(checkForBeacon, 1000);
	}

	function startScan() {
		function onBeaconsRanged(beaconInfo) {
			for (var i in beaconInfo.beacons) {
				var beacon = beaconInfo.beacons[i];

				if (beacon.rssi < 0 && beacon.macAddress == "CE:95:71:43:C9:DD") {
					console.log("Found room beacon");
					roomBeacon = beacon;
				}
			}
		}

		function onError(errorMessage) {
			console.log("Ranging beacons did fail: " + errorMessage);
		}

		estimote.beacons.requestAlwaysAuthorization();

		estimote.beacons.startRangingBeaconsInRegion(
			{},
			onBeaconsRanged,
			onError);
	}

	function checkForBeacon() {
		if (roomBeacon) {
			console.log("Checking beacon distance");

			if (roomBeacon.distance < 2 && !inRoom) {
				console.log("Entered the room");
				inRoom = true;
				$("html").addClass("in-room");
				$("#in-room").html("In room!");

				turnOnBulb();

				setTimeout(turnOnBulb, 1000);
			} else if (roomBeacon.distance >= 2 && inRoom) {
				console.log("Exited the room");
				inRoom = false;
				$("html").removeClass("in-room");
				$("#in-room").html("Out of room!");

				turnOffBulb();
				setTimeout(turnOnBulb, 1000);
			}
		}
	}

	function turnOnBulb() {
		$.getJSON('https://maker.ifttt.com/trigger/entered_room/with/key/{YOURKEYHERE}?jsoncallback=?', {
			format: "json"
		}, function() {
			console.log("Entered room and told IFTTT about it!");
		})
		.done(function(data) {
			console.log('Done');
		})
		.fail(function(data) {
			console.log(JSON.stringify(data));
		})
		.always(function(data) {
			console.log('Finished');
		});
    console.log("Turn on bulb");
	}

	function turnOffBulb() {
		$.getJSON('https://maker.ifttt.com/trigger/left_room/with/key/{YOURKEYHERE}?jsoncallback=?', {
			format: "json"
		}, function() {
			console.log("Left room and told IFTTT about it!");
		})
		.done(function(data) {
			console.log('Done');
		})
		.fail(function(data) {
			console.log(JSON.stringify(data));
		})
		.always(function(data) {
			console.log('Finished');
		});
    console.log("Turn off bulb");
	}

	return app;
})();

app.initialize();