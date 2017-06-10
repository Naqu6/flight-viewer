var NUMBER_OF_POINTS = 250.0; // Accurate within 1 point
var NUMBER_OF_SECONDS_IN_DAY = 86400.0;
var SECONDS_TO_HOURS = 0.000277778;
var HOURS_TO_MINUTES = 60;
var METERS_TO_FEET = 3.28084;
var METERS_TO_NM = 0.000539957;


$(document).ready(function() {
	Cesium.BingMapsApi.defaultKey="WCDFG1t7dCho3pYtjhP3~9TtLhJwfh4TmoCzzEsWmJg~ArVbBS52XqbPzY8aDjPfjh1biz_l3e8vI6sseb6k7TuH9omW5MjD3v6ex6i2dKjy";
	var viewer = new Cesium.Viewer('cesiumContainer');

	// Set Cesium Key and Viewer

	var flight;
	var StartTime;
	var EndTime;

	var usedEntites = [];

	$(".setEndTime").hide();

	$(".toggleFlightPath").hide();
	$(".toggleRealCourse").hide();
	$(".toggleTargetCourse").hide();
	$(".resultsdiv").hide();

	function getGroundPosition(point) {
		var cartoCoords = Cesium.Ellipsoid.WGS84.cartesianToCartographic(point);
		cartoCoords.height = 0;

		cartesianPoint = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartoCoords);

		return cartesianPoint;
	}

	// function segmentLine(startPositon, endPosition, numberOfPoints) {
	// 	var deltaKeys = ["x", "y", "z"];
	// 	var deltas = [];
	// 	var valueAdded = [];

	// 	var results = [];


	// 	for (var i = 0; i< deltaKeys.length; i++) {
	// 		deltas.push((endPosition[deltaKeys[i]] - startPositon[deltaKeys[i]])/numberOfPoints);
	// 		valueAdded.push(0.0);
	// 	}

	// 	for (var i = 0; i < numberOfPoints; i++ ) {
	// 		additions = [];

	// 		for (var j = 0; j < deltaKeys.length; j++) {
	// 			additions[j] = valueAdded[j] + deltas[j];
	// 			valueAdded[j] += deltas[j];
	// 		};

	// 		results.push(new Cesium.Cartesian3(additions[0], additions[1], additions[2]));
	// 	}

	// 	return results;

	// }

	function drawGroundPath(positions, color) {


		var entites = [];
		for (var i = 0; i < positions.length - 1; i++) {


			entites.push(viewer.entities.add({
				name: 'Height',
				polygon: {
					hierarchy: [positions[i], positions[i+1], getGroundPosition(positions[i + 1]), getGroundPosition(positions[i])],
					material: color,
					height: 0,
					extrudedHeight: Cesium.Ellipsoid.WGS84.cartesianToCartographic(positions[i]).height
				}
			}));
		}

		return entites;
	}

	function toggleVisibilityOfElementsInArray(array) {
		for (var i = 0; i<array.length; i++) {
			array[i].show = !array[i].show;
		}
	}

	var dataTitles = [
		{
			dataName: "initialAltitude",
			title: "Initial Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "finalAltitude",
			title: "Final Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "averageAltitude",
			title: "Average Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "minAlt",
			title: "Minimum Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "maxAlt",
			title: "Maximum Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "initialSpeed",
			title: "Initial Speed: ",
			unit: " knots"
		}, {
			dataName: "finalSpeed",
			title: "Final Speed: ",
			unit: " knots"
		}, {
			dataName: "averageSpeed",
			title: "Average Speed: ",
			unit: " knots"
		}, {
			dataName: "minSpeed",
			title: "Minimum Speed: ",
			unit: " knots"
		}, {
			dataName: "maxSpeed",
			title: "Maximum Speed: ",
			unit: " knots"
		}, {
			dataName: "distance",
			title: "Total Distance: ",
			unit: " nautical miles"
		}, {
			dataName: "initialVerticalSpeed",
			title: "Initial Vertical Speed: ",
			unit: " feet per minute"
		}, {
			dataName: "finalVerticalSpeed",
			title: "Final Vertical Speed: ",
			unit: " feet per minute"
		}, {
			dataName: "averageVerticalSpeed",
			title: "Average Vertical Speed:" ,
			unit: " feet per minute"
		}, {
			dataName: "maxVerticalSpeed",
			title: "Max Vertical Speed: ",
			unit: " feet per minute"
		}, {
			dataName: "minVerticalSpeed",
			title: "Minimum Vertical Speed: ",
			unit: " feet per minute"
		}
	]

	function buildDataTitles(data) {
		var result = "";

		for (var i = 0; i < dataTitles.length; i++) {
			dataTitle = dataTitles[i];

			result += dataTitle.title + Math.trunc(data[dataTitle.dataName]) + dataTitle.unit + "\n\n";
		}

		return result;
	}

	var maneuvers = {
		straightAndLevel: function(data, startTime, endTime) {
			targetCourse = viewer.entities.add({
			    name : 'Target Course',
			    polyline : {
			        positions : [data.positions[0], data.positions[data.positions.length-1]],
			        width : 5,
			        material : Cesium.Color.BLUE
			    }
			});

			actualCourse = viewer.entities.add({
			    name : 'Actual Course',
			    polyline: {
			        positions: data.positions,
			        material: Cesium.Color.RED
			    }
			});

			actualCourseGroundLines = drawGroundPath(data.positions, Cesium.Color.RED.withAlpha(0.5));

			usedEntites.push(targetCourse);
			usedEntites.push(actualCourse);

			for (var i = 0; i<actualCourseGroundLines.length; i++) {
				usedEntites.push(actualCourseGroundLines[i]);
			}

			$(".toggleRealCourse").on("click", function() {
				actualCourse.show = !actualCourse.show;

				toggleVisibilityOfElementsInArray(actualCourseGroundLines);
			});

			$(".toggleTargetCourse").on("click", function() {
				targetCourse.show = !targetCourse.show;

			});

			var result = "STRAIGHT AND LEVEL FLIGHT STATISTICS: \n\n" + buildDataTitles(data);

			$(".results").text(result);
			$(".results").html($(".results").html().replace(/\n/g,'<br>'));

		}, climb: function(data, startTime, endTime) {
			targetCourse = viewer.entities.add({
			    name : 'Target Course',
			    polyline : {
			        positions : [data.positions[0], data.positions[data.positions.length-1]],
			        width : 5,
			        material : Cesium.Color.BLUE
			    }
			});

			actualCourse = viewer.entities.add({
			    name : 'Actual Course',
			    polyline: {
			        positions: data.positions,
			        material: Cesium.Color.RED
			    }
			});

			actualCourseGroundLines = drawGroundPath(data.positions, Cesium.Color.RED.withAlpha(0.5));

			usedEntites.push(targetCourse);
			usedEntites.push(actualCourse);

			for (var i = 0; i<actualCourseGroundLines.length; i++) {
				usedEntites.push(actualCourseGroundLines[i]);
			}

			$(".toggleRealCourse").on("click", function() {
				actualCourse.show = !actualCourse.show;

				toggleVisibilityOfElementsInArray(actualCourseGroundLines);
			});

			$(".toggleTargetCourse").on("click", function() {
				targetCourse.show = !targetCourse.show;

			});

			var result = "CLIMB STATISTICS: \n\n" + buildDataTitles(data);

			$(".results").text(result);
			$(".results").html($(".results").html().replace(/\n/g,'<br>'));

		}, descent: function(data, startTime, endTime) {

			targetCourse = viewer.entities.add({
			    name : 'Target Course',
			    polyline : {
			        positions : [data.positions[0], data.positions[data.positions.length-1]],
			        width : 5,
			        material : Cesium.Color.BLUE
			    }
			});

			actualCourse = viewer.entities.add({
			    name : 'Actual Course',
			    polyline: {
			        positions: data.positions,
			        material: Cesium.Color.RED
			    }
			});

			actualCourseGroundLines = drawGroundPath(data.positions, Cesium.Color.RED.withAlpha(0.5));

			usedEntites.push(targetCourse);
			usedEntites.push(actualCourse);

			for (var i = 0; i<actualCourseGroundLines.length; i++) {
				usedEntites.push(actualCourseGroundLines[i]);
			}

			$(".toggleRealCourse").on("click", function() {
				actualCourse.show = !actualCourse.show;

				toggleVisibilityOfElementsInArray(actualCourseGroundLines);
			});

			$(".toggleTargetCourse").on("click", function() {
				targetCourse.show = !targetCourse.show;

			});

			var result = "DESCENT STATISTICS: \n\n" + buildDataTitles(data);

			$(".results").text(result);
			$(".results").html($(".results").html().replace(/\n/g,'<br>'));

		}, landingApproach: function(data, startTime, endTime) {

			targetCourse = viewer.entities.add({
			    name : 'Target Course',
			    polyline : {
			        positions : [data.positions[0], data.positions[data.positions.length-1]],
			        width : 5,
			        material : Cesium.Color.BLUE
			    }
			});

			actualCourse = viewer.entities.add({
			    name : 'Actual Course',
			    polyline: {
			        positions: data.positions,
			        material: Cesium.Color.RED
			    }
			});

			actualCourseGroundLines = drawGroundPath(data.positions, Cesium.Color.RED.withAlpha(0.5));

			usedEntites.push(targetCourse);
			usedEntites.push(actualCourse);

			for (var i = 0; i<actualCourseGroundLines.length; i++) {
				usedEntites.push(actualCourseGroundLines[i]);
			}

			$(".toggleRealCourse").on("click", function() {
				actualCourse.show = !actualCourse.show;

				toggleVisibilityOfElementsInArray(actualCourseGroundLines);
			});

			$(".toggleTargetCourse").on("click", function() {
				targetCourse.show = !targetCourse.show;

			});

			var result = "LANDING APPROACH STATISTICS: \n\n" + buildDataTitles(data);

			$(".results").text(result);
			$(".results").html($(".results").html().replace(/\n/g,'<br>'));

		}, turnsAroundAPoint: function(data, startTime, endTime) {

			var totalDistance = 0.0;

			for (var i = 0; i < data.positions.length; i++) {
				totalDistance += Cesium.Cartesian3.distance(data.averagePosition, data.positions[i]);
			}

			var averageDistance = totalDistance/data.positions.length;

			var targetCourse = viewer.entities.add({
			    position: data.averagePosition,
			    name: 'Target Course',
			    ellipse: {
			        semiMinorAxis : averageDistance,
			        semiMajorAxis : averageDistance,
			        material : Cesium.Color.BLUE.withAlpha(0.5),
			        outline : true
			    }
			});

			var actualCourse = viewer.entities.add({
			    name: 'Actual Course',
			    polygon: {
			        hierarchy: data.positions,
			        material: Cesium.Color.RED.withAlpha(0.5),
			    }
			});

			actualCourseGroundLines = drawGroundPath(data.positions, Cesium.Color.RED.withAlpha(0.5));

			usedEntites.push(targetCourse);
			usedEntites.push(actualCourse);

			for (var i = 0; i<actualCourseGroundLines.length; i++) {
				usedEntites.push(actualCourseGroundLines[i]);
			}

			$(".toggleRealCourse").on("click", function() {
				actualCourse.show = !actualCourse.show;
				toggleVisibilityOfElementsInArray(actualCourseGroundLines);
			});

			$(".toggleTargetCourse").on("click", function() {
				targetCourse.show = !targetCourse.show;
			});

			var result = "TURNS AROUND A POINT STATISTICS: \n\n" + buildDataTitles(data);

			$(".results").text(result);
			$(".results").html($(".results").html().replace(/\n/g,'<br>'));

		}
	}

	data = [];

	// Setup Initial KML LOAD
	$(".kmlFile").change(function() {

		// Set the data source
		// $(".kmlFile") is a jquery array, so we need to get the first element (the input), and then query the uploaded files.
		// Files[0] is the correct file

		var dataSource = Cesium.KmlDataSource.load($(".kmlFile").get(0).files[0],
	     {
	     	// Set the camera and canvas to the current scene
	          camera: viewer.scene.camera,
	          canvas: viewer.scene.canvas
	     });

		$(".fileMessage").text("File Selected: " + $(".kmlFile").get(0).files[0].name);

		viewer.dataSources.add(dataSource).then(function(dSource) {

			if (dSource._entityCollection._entities._array.length == 2) {
				// Foreflight
				flight = dSource._entityCollection._entities._array[0];
			} else {
				// flightaware

				flight = dSource._entityCollection._entities._array[dSource._entityCollection._entities._array.length-1];
			}

			var aboveFlightPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(flight.position.getValue(entity.currentTime));
			aboveFlightPosition.height += 10000;

			aboveFlightPosition = Cesium.Ellipsoid.WGS84.cartographicToCartesian(aboveFlightPosition);
			
			viewer.camera.flyTo({
    			destination : aboveFlightPosition
			});
			
		});
	});

	function getPositionData(entity, startTime, endTime) { // Dont use global startTime and endTime 
		var entityPosition = entity.position;

		var data = {
			positions: [],
			distance: 0
		};

		var time = Cesium.JulianDate.clone(startTime);

		var dayDelta = endTime.dayNumber - startTime.dayNumber;
		var secondsDelta = endTime.secondsOfDay - startTime.secondsOfDay;

		var delta = dayDelta * NUMBER_OF_SECONDS_IN_DAY + secondsDelta;

		var secondsIncrease = delta/NUMBER_OF_POINTS;

		var x_total = 0;
		var y_total = 0;
		var z_total = 0;

		var speedTotal = 0;
		var altitudeTotal = 0;
		var verticalSpeedTotal = 0;

		var maxSpeed = -1;
		var minSpeed = Number.MAX_VALUE;

		var maxAlt = -Number.MAX_VALUE;
		var minAlt = Number.MAX_VALUE; 

		var maxVerticalSpeed = -Number.MAX_VALUE;
		var minVerticalSpeed = Number.MAX_VALUE;

		var i = 0;
		var lastTime;

		while (endTime.dayNumber > time.dayNumber || endTime.secondsOfDay >= time.secondsOfDay) { // Cesium.Compare() doesn't work as intended, using custom evaluation
			var currentPosition = entityPosition.getValue(time);

			data.positions.push(currentPosition);

			var cartoPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(currentPosition);

			x_total += currentPosition.x;
			y_total += currentPosition.y;
			z_total += currentPosition.z;

			var alt = cartoPosition.height * METERS_TO_FEET;

			altitudeTotal += alt;

			if (minAlt > alt) {
				minAlt = alt;
			}

			if (maxAlt < alt) {
				maxAlt = alt;
			}

			time.secondsOfDay += secondsIncrease;

			if (time.secondsOfDay > NUMBER_OF_SECONDS_IN_DAY) {
				time.dayNumber += 1;
				time.secondsOfDay -= NUMBER_OF_SECONDS_IN_DAY;
			}

			if (i > 0) {
				var lastPosition = data.positions[i-1];

				var legDistance = Math.abs(Cesium.Cartesian3.distance(lastPosition, currentPosition) * METERS_TO_NM)
				var heightDistance = METERS_TO_FEET * (cartoPosition.height - Cesium.Ellipsoid.WGS84.cartesianToCartographic(lastPosition).height);
				var hoursTimeDifference = SECONDS_TO_HOURS * Math.abs(Cesium.JulianDate.secondsDifference(lastTime, time));

				var speed = legDistance/hoursTimeDifference;

				var verticalSpeed = heightDistance/(HOURS_TO_MINUTES * hoursTimeDifference);

				speedTotal += speed;
				verticalSpeedTotal += verticalSpeed;

				if (speed > maxSpeed) {
					maxSpeed = speed;
				}

				if (speed < minSpeed) {
					minSpeed = speed
				}

				if (verticalSpeed > maxVerticalSpeed) {
					maxVerticalSpeed = verticalSpeed;
				}

				if (verticalSpeed < minVerticalSpeed) {
					minVerticalSpeed = verticalSpeed;
				}

				data.distance += legDistance;

				if (i == 1) {
					data.initialSpeed = speed
					data.initialVerticalSpeed = verticalSpeed;
				} else {
					data.finalSpeed = speed
					data.finalVerticalSpeed = verticalSpeed;
				}
			}

			lastTime = time.clone();

			i++;

		}

		data.averagePosition = new Cesium.Cartesian3(x_total/data.positions.length, y_total/data.positions.length, z_total/data.positions.length);

		data.initialAltitude = Cesium.Ellipsoid.WGS84.cartesianToCartographic(data.positions[0]).height * METERS_TO_FEET
		data.finalAltitude = Cesium.Ellipsoid.WGS84.cartesianToCartographic(data.positions[data.positions.length - 1]).height * METERS_TO_FEET

		data.maxSpeed = maxSpeed;
		data.minSpeed = minSpeed;

		data.maxAlt = maxAlt;
		data.minAlt = minAlt;

		data.averageSpeed = speedTotal/(data.positions.length-1);
		data.averageAltitude = altitudeTotal/(data.positions.length-1);

		data.minVerticalSpeed = minVerticalSpeed;
		data.maxVerticalSpeed = maxVerticalSpeed;

		data.averageVerticalSpeed = verticalSpeedTotal/(data.positions.length-1);

		return data;
	}


	$(".toggleFlightPath").on("click", function() {
		flight.show = !flight.show;
	})

	$(".setStartTime").on("click", function() {
		StartTime = viewer.clock.currentTime;

		$(".setStartTime").hide();
		$(".setEndTime").show();
	});

	$(".setEndTime").on("click", function() {
		EndTime = viewer.clock.currentTime;

		$(".setStartTime").show();
		$(".setEndTime").hide();
	});

	$(".setManeuver").on("click", function() {

		if (StartTime.dayNumber > EndTime.dayNumber && StartTime.EndTime.secondsOfDay > EndTime.secondsOfDay) {
			alert("Please Re-Select the Start Selection and End Selection. End of Selection Occurs Before Start of Selection.")
		}

		for (var i = usedEntites.length-1; i>=0; i--) {
			viewer.entities.remove(usedEntites[i]);
			usedEntites.splice(i,1);
		}


		$(".toggleFlightPath").show();
		$(".toggleRealCourse").show();
		$(".toggleTargetCourse").show();
		$(".resultsdiv").show();

		data = getPositionData(flight, StartTime, EndTime);
	    
	    var maneuver = maneuvers[$(".selectmaneuver").val()];

	    maneuver(data, StartTime, EndTime);
	});
});