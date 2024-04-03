/*jshint esversion: 6 */
/**
 * $Rev: 15777 $
 * $LastChangedDate: 2022-08-03 13:28:12 +0200 (Wed, 03 Aug 2022) $
 * $Author: jka $
 * 
 */
/** Enum for the different position roles */
const POSITION_ROLES = {
	NONE 				:1,
	STORAGE 			:3,
	WORKSTATION			:4,
	RETURN 				:5,
	CHARGER 			:6,
	WASHING_MACHINE		:7,
	ELEVATING_BUFFER	:9,
	ON_ROBOT			:10,
	LOST 				:11,
	SERVICE 			:12,
	STERILIZER_STATION	:13,
	REMEDA_LOADER		:14
}

const LANGUAGECODE = {
	EN 					:"en",
	DE 					:"de",
	DA 					:"da",
	ES 					:"es", 
	FI  				:"fi",
	JA 					:"ja", 
	NO 					:"no", 
	SV 					:"sv", 
}

/**
 * Enum for the machine roles
 */
const MACHINE_ROLE = {
	WASHER 			:1,
	RETURN 			:2,
	MONITOR			:3
}

/**
 * ENUM for the monitor state
 * @param {Number} State the states the monitor can be in
 */
const MONITOR_STATE={
	RESET						: 1,
	IDLE						: 2,
	LOADING						: 3,
	WORKING 					: 4,
	COMPLETED					: 5,
	UNLOADING					: 6,
	ERROR						: 7,
	MISTAKE						: 8,
}

/**
 * Enum for washingMachineTypes
 */
const DEVICE_TYPES = {
	WASHER_IQ5			: 5,
	WASHER_IQ6			: 6,
	RETURN_IQ5			: 7,
	RETURN_IQ6			: 8,
	STERILIZER_LOADER 	: 16
}

/**
 * Enum for rooms
 */
const ROOMS = {
	UNCLEAN : 0,
	CLEAN	: 1,
	STERILE	: 2
}

fullDictionary = [];

/* eslint no-unused-vars: ["error", {"varsIgnorePattern": "g_settings|setPayloadStatusImg|orderRackSelctorRadios|populateOrderRackByType|populateRackOrders|clearAlarm"}] */
// Defined by jquery
/* global $ */
// Defined by common.js
// Defined by login.js
/* global userLogout */
// Defined by storage.js

// Defined in socket.js
/* global simpleSocketRequest testModeAborted*/ //eslint-disable-line
/* Function that runs when the index.html is done loading */

$(document).ready(function()
{
	if( !localStorage.getItem("clean") && !localStorage.getItem("unclean") )
	{
		SelectSides();
	}
	document.getElementById("select_side_clean_cb").checked = localStorage.getItem("clean") == "true";
	document.getElementById("select_side_unclean_cb").checked = localStorage.getItem("unclean") == "true";
	document.getElementById("select_side_sterile_cb").checked = localStorage.getItem("sterile") == "true";
	simpleSocketRequest("request distributor");
});


window.onload = ()=>{
	if(!(localStorage.getItem("langCode")))
	{	
		simpleSocketRequest("request standard Language Code")
	}
	simpleSocketRequest("request settings");
	simpleSocketRequest("send new info 2.0");
	simpleSocketRequest("reload fulldictionarylist");
	simpleSocketRequest("request big screen update");
	simpleSocketRequest("request version numbers");
	simpleSocketRequest("request licence information");
	simpleSocketRequest("client setup request");
	simpleSocketRequest("active rooms request");
}

/** Update the clock and date in the bottom of the screen */
setInterval(()=>{
	var dd = new Date();
	document.getElementById("footer_time").innerHTML = dd.getHours() + ":" + (dd.getMinutes()<10?"0"+dd.getMinutes():dd.getMinutes());
	document.getElementById("footer_date").innerHTML = (dd.getDate()<10?"0"+dd.getDate():dd.getDate()) + "-" + ((dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1)) + "-" + dd.getFullYear();
},1000);


/**Author: MKL
 * Check to see if the display is still connected to the server
 * It checks to see if a tiny image is available. if not the server is not online
 */
setInterval(()=>{
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onload = function() 
	{ 	// server is online
		document.getElementById("serverConnection").style.display = "none";
		document.getElementById("connectionStatus").innerHTML = "";
	}
	xmlhttp.onerror = function() 
	{ 	// server is offline
		document.getElementById("serverConnection").style.display = "block";
		document.getElementById("connectionStatus").innerHTML = '<i class="fas fa-spinner fa-pulse fa-2x"></i> <br> Offline';
		document.getElementById("connectionStatus").style.color = "#dc3545";
		console.error("Connection to server is lost " );
	}
    //xmlhttp.open("GET","/dot_img.png",true);	//if can't get image, server is offline
    xmlhttp.send();
},1000);

/** Select what side to show racks and jobs from
 * Also select what robot(s) to pause
 * 
 * @param {*} side 
 */
function SelectSides(side="unclean")
{
	if(side == "unclean")
	{
		if( !document.getElementById("select_side_clean_cb").checked && !document.getElementById("select_side_sterile_cb").checked )
		{
			document.getElementById("select_side_unclean_cb").checked = true;
		}
	}
	else if(side == "clean")
	{
		if( !document.getElementById("select_side_unclean_cb").checked && !document.getElementById("select_side_sterile_cb").checked )
		{
			document.getElementById("select_side_clean_cb").checked = true;
		}
	}
	else if ( side == "sterile" )
	{
		if( !document.getElementById("select_side_unclean_cb").checked && !document.getElementById("select_side_clean_cb").checked )
		{
			document.getElementById("select_side_sterile_cb").checked = true;
		}
	}

	localStorage.setItem("clean", document.getElementById("select_side_clean_cb").checked);
	localStorage.setItem("unclean", document.getElementById("select_side_unclean_cb").checked);
	localStorage.setItem("sterile", document.getElementById("select_side_sterile_cb").checked);
	simpleSocketRequest("send new info 2.0");
}

function databaseOffline()
{
	location.replace('./systemoffline')
}

/**
 * Un-hides the sterile rooms for the user, if license is active.
 */
function ActivateSterileRoomIfLicenseActive( data )
{
	let isSterileLicenceActive = false;
	for ( var ii=0 ; ii < data.length ; ii++ )
	{
		if ( data[ii].id == ROOMS.STERILE )
		{
			document.getElementById("select_side_sterile_div").style.display = "block";
			document.getElementById("top_robot_sterile").style.display = "block";
			isSterileLicenceActive = true;
		}
	}

	if ( !isSterileLicenceActive )
	{
		
	}
}

const knownRobots = {};
/** Update the robot status and soc on the top of the sreen
 * @param {array} data Array containing information about the robots
 */
function UpdateRobotStatus(data)
{
	var cleanContainer = document.getElementById("top_robot_clean");
	var uncleanContainer = document.getElementById("top_robot_unclean");
	var sterileContainer = document.getElementById("top_robot_sterile");

	for( var ii in data)
	{
		var batterySrc
		var div = null;
		if(data[ii].soc < 0)
		{
			batterySrc = "./battery_0.png"
		}
		else if(data[ii].soc >= 0 && data[ii].soc < 20 && !data[ii].isCharging)
		{
			batterySrc = "./battery_critical.png"
		}
		else if(data[ii].soc >= 0 && data[ii].soc < 20 && data[ii].isCharging)
		{
			batterySrc = "./battery_critical_chg.png"
		}
		else if(data[ii].soc >= 20 && data[ii].soc < 25 && !data[ii].isCharging )
		{
			batterySrc = "./battery_1.png"
		}
		else if(data[ii].soc >= 20 && data[ii].soc < 25 && data[ii].isCharging )
		{
			batterySrc = "./battery_1_chg.png"
		}
		else if(data[ii].soc >= 25 && data[ii].soc < 50 && !data[ii].isCharging )
		{
			batterySrc = "./battery_2.png"
		}
		else if(data[ii].soc >= 25 && data[ii].soc < 50 && data[ii].isCharging )
		{
			batterySrc = "./battery_2_chg.png"
		}
		else if(data[ii].soc >= 50 && data[ii].soc < 75 && !data[ii].isCharging )
		{
			batterySrc = "./battery_3.png"
		}
		else if(data[ii].soc >= 50 && data[ii].soc < 75 && data[ii].isCharging )
		{
			batterySrc = "./battery_3_chg.png"
		}
		else if(data[ii].soc >= 75 && data[ii].soc <= 100 && !data[ii].isCharging )
		{
			batterySrc = "./battery_4.png"
		}
		else if(data[ii].soc >= 75 && data[ii].soc <= 100 && data[ii].isCharging )
		{
			batterySrc = "./battery_4_chg.png"
		}
		data[ii].batterySrc = batterySrc

		// var batterySrc = "./battery_" + socLowRes;
		var robotImg = document.createElement("img");
		var batteryImg = document.createElement("img");
	

		robotImg.setAttribute( "height","40px");
		robotImg.setAttribute( "src",data[ii].image);
		batteryImg.setAttribute( "height","40px");
	
		batteryImg.setAttribute( "src",batterySrc);
		
		div = document.getElementById("robot " + data[ii].id);
		if(!div)
		{
			div = document.createElement("span");
			div.setAttribute("id","robot " + data[ii].id);
			div.setAttribute("onclick","openRobot(\"" + data[ii].id + "\")")
			div.appendChild(robotImg);
			div.appendChild(batteryImg);
	

		}
		else
		{
			if( data[ii].image != knownRobots[data[ii].id].image )
			{
				div.replaceChild(robotImg, div.children[0]);
			}
			if( knownRobots[data[ii].id].batterySrc != batterySrc )
			{
				div.replaceChild(batteryImg, div.children[1]);
			}
		}
		if(parseInt(data[ii].roomId) == 2) sterileContainer.appendChild(div);
		else if(parseInt(data[ii].roomId) == 1) cleanContainer.appendChild(div);
		else uncleanContainer.appendChild(div);
		knownRobots[data[ii].id] = data[ii];
	}
}

/**Author: MKL
 * This makes it possible to access the Robot
 * @param {*} id the database id of the robot	@todo make this the serialnumber of the robot
 */
function openRobot(id)
{
	$("#robotModal").modal("show");
	$(".modal").on("shown.bs.modal", function () {
	   if ($(".modal-backdrop").length > 1) {
		   $(".modal-backdrop").not(':first').remove();	// remove if there are multiple modal baggrounds
	   }
   });

   if ( knownRobots[id].moveAwayPosition_guid )
   {
		document.getElementById("moveRobotAway_button").setAttribute("onclick", `moveRobotAway(${id})`);
		document.getElementById("resumeJobs_button").setAttribute("onclick", `restartRobotController(${id})`);
		document.getElementById("robotMoveAway_div").style.display = "block";
   }
   else
   {
		document.getElementById("robotMoveAway_div").style.display = "none";
   }
   document.getElementById("nextTenRobotErrorEvents_button").setAttribute("onclick", `getTheNext10RobotErrorEvents(${id})`);
   document.getElementById("newestTenRobotErrorEvents_button").setAttribute("onclick", `getRobotErrorEvents(${id}, null)`);


   getRobotInformation(id)
   getRobotStatus(id)
   getRobotErrorEvents(id, null);
}

function HideRobotModal()
{
	$("#robotModal").modal("hide");
}


/** Populate the rack ordering tables for ordering racks by positions
 * This function filters the racks that should not be displayed
 * @param data  This is the racksandpositions	
 */
function PopulateRackOrders(data)
{
	document.getElementById("rackTitle").setAttribute("class", "dict_rack");
	document.getElementById("rackTitle").innerHTML = ( fullDictionary.length > 0? GetDictionaryText('12164e28-e517-11e9-ae50-00ff33556161') : "Racks" );

	const RackData = $.extend(true,[],data);	// MKL copy data to new array, so we can manipulate them with changing the original


	var orderByPositionTable = document.getElementById("rack_list");
	
	var showCleanRacks = document.getElementById("select_side_clean_cb").checked;
	var showUncleanRacks = document.getElementById("select_side_unclean_cb").checked;
	var showSterileSide = document.getElementById("select_side_sterile_cb").checked;

	orderByPositionTable.innerHTML = "";
	var doubles = [];
	
	// Find positions in error before filtering
	var positionInSoftError = false;
	for(var ii = 0 ; ii < RackData.length ; ii++)
	{
		if ( !positionInSoftError && g_settings && g_settings.softErrorUnsuccessfulDropoffThreshold && RackData[ii].errorCounter >= g_settings.softErrorUnsuccessfulDropoffThreshold.onsiteValue && RackData[ii].errorCounter < 999 )
		{
			// document.getElementById("positionInError_button").setAttribute("onclick", "ManuallyMoveRack(" + RackData[ii].posId + ", " + RackData[ii].rackId + ", " + 0 + ", \""+ RackData[ii].rackTag + " - " 	+ RackData[ii].rackTypeName + "\", true)");
			document.getElementById("positionInError_button").setAttribute("class", "btn btn-warning btn-lg");
			document.getElementById("positionInError_button").style.backgroundColor = "#fcf003";
			// document.getElementById("positionInError_span").innerHTML = GetDictionaryText('82687e9b-57bd-11ea-a8bf-00ff33556161');
			// document.getElementById("positionInError_div").style.display = "block";
			
			positionInSoftError = RackData[ii].posId;
			document.getElementById("positionInError_button").setAttribute("onclick", "ShowPositionWithUnknownRackModal('" + RackData[ii].posName + "')");
			document.getElementById("positionInError_posId").value = RackData[ii].posId;
		}
	}

	if ( positionInSoftError !== false )
	{
		document.getElementById("positionInError_div").style.display = "block";
	}
	else
	{
		document.getElementById("positionInError_div").style.display = "none";
	}

	// MKL removing null elements before sorting
	for( var i = 0; i < RackData.length; i++){ 
		if ( RackData[i].rackTag === null ) {
			RackData.splice(i, 1); 
		  i--;
		}
	 }

	// Remove elements from deselected sides
	var hideWasherRooms = !showCleanRacks && !showUncleanRacks
	for( var i = 0; i < RackData.length; i++) {
		let isSterileRack = RackData[i].washingMachineType == DEVICE_TYPES.STERILIZER_LOADER;
		if ( ( hideWasherRooms && !isSterileRack )
			 || ( !showSterileSide && isSterileRack ) ) {
			RackData.splice(i, 1); 
		  i--;
		}
	 }

	//  MKL sorting the data by rackTag
	//  RackData.sort((a,b)=>{
	// 	if( a.rackTag > b.rackTag)
	// 	{
	// 		return 1
	// 	}
	// 	else
	// 	{
	// 		return -1
	// 	}
	// })

	let isLostRackInList = false;
	let posRackOnRobot = null;

	for(var ii = 0 ; ii < RackData.length ; ii++)
	{
		if( !RackData[ii].rackId ) continue;							// skip if there is no rack to show
		if( !showCleanRacks && RackData[ii].roomId == ROOMS.CLEAN && RackData[ii].posRole != POSITION_ROLES.LOST) continue; 		// Skip if this is a clean rack and we should not show the clean racks
		if( !showUncleanRacks && RackData[ii].roomId == ROOMS.UNCLEAN  && RackData[ii].posRole != POSITION_ROLES.LOST) continue;	// Skip if this is an unclean rack and we should not show the unclean racks

		//MKL: dont show the doubles in rack list when Paused
		if(RackData[ii].reservedForPosition != null)
		{
			if(doubles.includes(RackData[ii].rackCurrentPos))
			{	
				continue;										// skib if there er mulitple of same racks
			}
			else
			{
				doubles.push(RackData[ii].rackCurrentPos);	
			}				
		}
		CreateRackToOrder(RackData[ii]);

		if ( !isLostRackInList && RackData[ii].posRole == POSITION_ROLES.LOST )
		{
			document.getElementById("lostRacksPresent_button").setAttribute("onclick", "ManuallyMoveRack(" + RackData[ii].posId + ", " + RackData[ii].rackId + ", " + (RackData[ii].washingMachineType == DEVICE_TYPES.STERILIZER_LOADER? ROOMS.STERILE : RackData[ii].roomId) + ", " + 0 + ", \""+ RackData[ii].rackTag + " - " 	+ RackData[ii].rackTypeName + "\", true)");
			document.getElementById("lostRacksPresent_button").setAttribute("class", "btn btn-warning btn-lg");
			document.getElementById("lostRacksPresent_button").style.backgroundColor = "#fcf003";
			document.getElementById("lostRacksPresent_span").innerHTML = GetDictionaryText('82687e9b-57bd-11ea-a8bf-00ff33556161');
			document.getElementById("lostRacksPresent_div").style.display = "block";

			isLostRackInList = true;
		}
		else if ( !posRackOnRobot && RackData[ii].posRole == POSITION_ROLES.ON_ROBOT && RackData[ii].reserved == 0 && RackData[ii].roomId != ROOMS.STERILE )
		{
			posRackOnRobot = RackData[ii];
		}
		
		if ( !positionInSoftError && g_settings && g_settings.softErrorUnsuccessfulDropoffThreshold && RackData[ii].errorCounter >= g_settings.softErrorUnsuccessfulDropoffThreshold.onsiteValue && RackData[ii].errorCounter < 999 )
		{
			// document.getElementById("positionInError_button").setAttribute("onclick", "ManuallyMoveRack(" + RackData[ii].posId + ", " + RackData[ii].rackId + ", " + 0 + ", \""+ RackData[ii].rackTag + " - " 	+ RackData[ii].rackTypeName + "\", true)");
			document.getElementById("positionInError_button").setAttribute("class", "btn btn-warning btn-lg");
			document.getElementById("positionInError_button").style.backgroundColor = "#fcf003";
			// document.getElementById("positionInError_span").innerHTML = GetDictionaryText('82687e9b-57bd-11ea-a8bf-00ff33556161');
			// document.getElementById("positionInError_div").style.display = "block";
			
			positionInSoftError = RackData[ii].posId;
			document.getElementById("positionInError_button").setAttribute("onclick", "ShowPositionWithUnknownRackModal('" + RackData[ii].posName + "')");
			document.getElementById("positionInError_posId").value = RackData[ii].posId;
		}
	}

	if ( !isLostRackInList )
	{
		if ( posRackOnRobot )
		{
			document.getElementById("lostRacksPresent_button").setAttribute("onclick", "ShowModal(" + posRackOnRobot.rackId + ", \""
			+ posRackOnRobot.posName + "\"," + posRackOnRobot.posRole + ",\""+ posRackOnRobot.rackTag + " - " 
			+ posRackOnRobot.rackTypeName + "\"," + posRackOnRobot.roomId + ", " + posRackOnRobot.posId + ", " 
			+ ((posRackOnRobot.posRole == POSITION_ROLES.WASHING_MACHINE || posRackOnRobot.posRole == POSITION_ROLES.RETURN)? 1 : 0 ) + ", true )" );
			document.getElementById("lostRacksPresent_button").setAttribute("class", "btn btn-danger btn-lg");
			document.getElementById("lostRacksPresent_button").style.backgroundColor = "";
			document.getElementById("lostRacksPresent_span").innerHTML = GetDictionaryText('d2e0ca10-57bd-11ea-a8bf-00ff33556161');
			document.getElementById("lostRacksPresent_div").style.display = "block";
		}
		else
		{
			document.getElementById("lostRacksPresent_div").style.display = "none";
		}
	}
}

/** Build the table with the rack that can be ordered 
*/
function CreateRackToOrder(rack)
{
	var el = document.getElementById("rack_list");
	var tbl = document.createElement("table"), row, cell;
	tbl.style.fontSize = "x-large";
	tbl.classList.add("rackToOrderClass");


	if( rack.reserved  == 1)		// rack.reservedForPosition != null ||
	{
		tbl.classList.add("disabled");
	}
	else if(rack.rackStatus == 99)	// OUT FOR SERVICE
	{
		tbl.classList.add("disabled");
	}
	else if ( (rack.posRole == POSITION_ROLES.WASHING_MACHINE && !rack.roomId) || 
			  (rack.posRole == POSITION_ROLES.RETURN && rack.roomId) ||
			  (rack.posRole == POSITION_ROLES.LOST) )
	{
		let isAllowedToGoBack = 0;
		let wasLostButtonUsed = false;
		let showClientSelector = (rack.posRole == POSITION_ROLES.WASHING_MACHINE && !rack.roomId  && isMultipleClientOptionActive); // Show client selector, if washing machine on unclean side, to allow for adding client, while washing (eg. if manually loaded into washer)
		let currentClient = rack.currentClient? rack.currentClient : -1;
		tbl.setAttribute("onclick","ManuallyMoveRack(" + rack.posId + ", " + rack.rackId + ", "  + (rack.washingMachineType == DEVICE_TYPES.STERILIZER_LOADER? ROOMS.STERILE : rack.roomId) + ", " + isAllowedToGoBack + ", \""+ rack.rackTag + " - " 	+ rack.rackTypeName + "\", " + wasLostButtonUsed + ", " + showClientSelector + ", " + currentClient + ", + " + rack.sterilizerRackTableId + ")");
	}
	else
	{
		var tmpClient = -1; // If no client selected / default client chosen, then set selector to "None"
		if ( rack.posRole == POSITION_ROLES.WASHING_MACHINE )
			tmpClient = rack.currentClient ? rack.currentClient : -1; // We want the selector to show the current client, if the rack is already in the washer (washing / ready to create empty job)
		else if ( rack.clientOwningPosition )
			tmpClient = rack.clientOwningPosition ? rack.clientOwningPosition : -1; // If a client owning this position have been chosen, set this to the default client selector in all other cases.
		
		tbl.setAttribute("onclick","ShowModal(" + rack.rackId + ", \""
		+ rack.posName + "\"," + rack.posRole + ",\""+ rack.rackTag + " - " 
		+ rack.rackTypeName + "\"," + rack.roomId + ", " + rack.posId + ", " 
		+ ((rack.posRole == POSITION_ROLES.WASHING_MACHINE || rack.posRole == POSITION_ROLES.RETURN)? 1 : 0 ) + ", false, " + tmpClient + ", " + (rack.currentClientName? `'${rack.currentClientName}'` : null) + ")" );
	}

	// this is for changing the background color of the racks
	switch (rack.rackStatus) {
		case 1:		//ReadyOnUnclean
			tbl.classList.add("RackStatus-ReadyOnUnclean");
			break;
		case 2:		//Waiting for wash
			tbl.classList.add("RackStatus-WaitingForWash");	
			break;
		case 3:		//Washing
			tbl.classList.add("RackStatus-Washing");
			break;
		case 4:		//Ready on clean
			tbl.classList.add("RackStatus-ReadyOnclean");
			break;
		case 5:		//Waiting for return
			tbl.classList.add("RackStatus-WaitingForReturn");
			break;
		case 6:		//Returning
			tbl.classList.add("RackStatus-Returning");
			break;
		case 7:		//Handled manually
			tbl.classList.add("RackStatus-HandledManually");
			break;
		case 8:		//waiting for robot
			tbl.classList.add("RackStatus-WaitingForRobot");
			break;
		case 10:		//On Robot
			tbl.classList.add("RackStatus-OnRobot");
			break;
		case 11:		//On Robot
			tbl.classList.add("RackStatus-InProgress");
			break;
		case 12:		//ReadyOnSterile
			tbl.classList.add("RackStatus-ReadyOnClean");
			break;
		case 97:		//On Robot Error
			tbl.classList.add("RackStatus-OnRobotError");
			break;
		case 98:		//Lost
			tbl.classList.add("RackStatus-Lost");
			break;
		case 99:		//Out of service
			tbl.classList.add("RackStatus-OutOfService");
			break;

		default:
			break;
	}
	
	row = tbl.insertRow(0);
	cell = row.insertCell(0);
	cell.setAttribute("class","col-xs-2");
	cell.setAttribute("data-al10-lang", "");
	cell.innerHTML = "<i class=\"far fa-calendar fa-rotate-180\"></i>";

	cell = row.insertCell(1);
	cell.setAttribute("class","col-xs-6");
	cell.innerHTML = "<b>" + rack.rackTag + " - " + rack.rackTypeName + "</b>";

	row = tbl.insertRow(1);
	cell = row.insertCell(0);
	cell.setAttribute("class","col-xs-2");
	cell.innerHTML = "<i class='fas fa-map-marker-alt'></i>";

	cell = row.insertCell(1);
	cell.setAttribute("class","col-xs-6");

	// MKL: Checks if the rack is currently in a job. 
	
	let roomIcon = ( rack.roomId == ROOMS.UNCLEAN ? " <i class=\"fas fa-allergies \"></i> " : ( rack.roomId == ROOMS.CLEAN ? " <i class=\"fas fa-hand-sparkles \"></i> " : " <i class=\"fas fa-virus-slash \"></i> " ) );

	switch (rack.posRole) 
	{
		case POSITION_ROLES.STORAGE:
			cell.innerHTML = "<b>" + roomIcon  + " <i class=\"fas fa-pause-circle\"></i> "+ rack.posName + "</b>";
			
			break;
		case POSITION_ROLES.ELEVATING_BUFFER:
		case POSITION_ROLES.WORKSTATION:
		case POSITION_ROLES.STERILIZER_STATION:
			cell.innerHTML = "<b>" + roomIcon  + "<i class=\"fas fa-sign-language\"></i> " + rack.posName + "</b>";
			break;
		case POSITION_ROLES.WASHING_MACHINE:
		case POSITION_ROLES.REMEDA_LOADER:
			cell.innerHTML = "<b>" + roomIcon  + "<i class=\"fas fa-shower\"></i> " + rack.posName + "</b>";
			break;
		case POSITION_ROLES.ON_ROBOT:
			cell.innerHTML = "<b>" + roomIcon  + "<i class=\"fas fa-truck-pickup\"></i> " + rack.posName + "</b>";
			break;
		case POSITION_ROLES.RETURN:
			cell.innerHTML = "<b>" + roomIcon  + "<i class=\"fas fa-door-open\"></i> "+ rack.posName + "</b>";
			break;
		case POSITION_ROLES.SERVICE:
			cell.innerHTML = "<b>" + GetDictionaryText('57064fc6-57c0-11ea-a8bf-00ff33556161') + "</b>"; //"<b>" + (rack.roomId==1?" <i class=\"fas fa-hand-sparkles \"></i> ":" <i class=\"fas fa-allergies \"></i> ")  + "<i class=\"fas fa-question-circle\"></i> "+ rack.posName + "</b>";
			break;
		case POSITION_ROLES.LOST:
			cell.innerHTML = "<b>" + GetDictionaryText('0521d37a-57be-11ea-a8bf-00ff33556161') + "</b>"; //"<b>" + (rack.roomId==1?" <i class=\"fas fa-hand-sparkles \"></i> ":" <i class=\"fas fa-allergies \"></i> ")  + "<i class=\"fas fa-question-circle\"></i> "+ rack.posName + "</b>";
			break;
		default:
			break;
	}

	// if ( rack.currentClientName )
	// {
	// 	row = tbl.insertRow(2);
	// 	cell = row.insertCell(0);
	// 	cell.setAttribute("class","col-xs-2");
	// 	cell.innerHTML = "<i class='fas fa-users'></i>";
	
	// 	cell = row.insertCell(1);
	// 	cell.setAttribute("class","col-xs-6");
	// 	cell.innerHTML = `<b>${rack.currentClientName ? rack.currentClientName : "None"}</b>`;
	// }

	el.appendChild(tbl);
}

function RevealHiddenSelectorsIfConidtionIsMet()
{
	RevealClientSelectorIfWasherChosen();
	RevealProgramSelectorIfRemedaLoaderChosen();
}

isMultipleClientOptionActive = false;
/** 
 * Check if new to-position is a washer, and if yes, show the client selector (only if licence is active) 
 */
function RevealClientSelectorIfWasherChosen()
{
	if ( !isMultipleClientOptionActive )
	{	// If option is not active, keep client selector hidden.
		return;
	}
	var toPosId = document.getElementById("moveRackToPosition").value;
	if ( g_positions[toPosId].posRole == POSITION_ROLES.WASHING_MACHINE && g_positions[toPosId].roomId == 0 )
	{
		document.getElementById("moveToClientOrder").style.display = "block";
	}
	else
	{
		document.getElementById("moveToClientOrder").style.display = "none";
	}
}

function RevealProgramSelectorIfRemedaLoaderChosen()
{
	var toPosId = document.getElementById("moveRackToPosition").value;
	if ( toPosId && g_positions[toPosId].posRole == POSITION_ROLES.REMEDA_LOADER )
	{
		document.getElementById("moveToProgramDiv").style.display = "block";
	}
	else
	{
		document.getElementById("moveToProgramDiv").style.display = "none";
	}
}

var robotCleanPositions = [];
var robotUncleanPositions = [];
var robotSterilePositions = [];

var uncleanToPosSelectorOptions = null;//document.createElement("select");
var cleanToPosSelectorOptions = null;//document.createElement("select");
var sterileToPosSelectorOptions = null;//document.createElement("select");

var g_positions = [];
var g_racks = [];

var sterileRobotPosId = null;
/** Fill the dropdowns for selecting the positions in the createJob modal
 * 
 */
function PopulateOrderPositionSelector(data)
{
	const RackData = $.extend(true,[],data); // MKL copy data to new array, so we can manipulate them without changing the original

	robotCleanPositions = [];
	robotUncleanPositions = [];
	uncleanToPosSelectorOptions = document.createElement("select");
	cleanToPosSelectorOptions = document.createElement("select");
	washerRoomSelectPositionManuallySelectorOptions = document.getElementById("manualMoveRackToPosition");
	sterileToPosSelectorOptions = document.createElement("select");
	washerRoomSelectPositionManuallySelectorOptions.innerHTML = "";
	// from position list
	var elFrom = document.getElementById("moveRackFromPosition"); /** PSK Adding From list */
	elFrom.innerHTML = "";    // elFrom.appendChild(name);

	// 
	// var SelectPosition = document.getElementById("selectPositionSelector");
	// SelectPosition.innerHTML ="";

	var showCleanPositions = document.getElementById("select_side_clean_cb").checked;
	var showUncleanPositions = document.getElementById("select_side_unclean_cb").checked;
	var showSterilPositions = document.getElementById("select_side_sterile_cb").checked;

	// var g_positions = [];
	// var g_racks = [];

	// Make a copy of the global list of racks
	for ( var i = 0; i < RackData.length; i++ )
	{
		if ( RackData[i].rackId != null )
		{
			g_racks[RackData[i].rackId] = RackData[i];
		}
	}

	// MKL removing null elements before sorting
	for( var i = 0; i < RackData.length; i++)
	{ 
		if ( RackData[i].posName === null ) {
			RackData.splice(i, 1); 
		  	i--;
		}
	}

	// Remove elements from rooms that are disabled
	var washerRoomIsHidden = !showCleanPositions && !showUncleanPositions;
	for ( var i = 0; i < RackData.length; i++ )
	{
		let isPositionInSterileRoom = RackData[i].roomId == ROOMS.STERILE;
		if ( ( washerRoomIsHidden && !isPositionInSterileRoom ) || ( !showSterilPositions && isPositionInSterileRoom ) )
		{
			RackData.splice(i, 1);
			i--;
		}
	}

	// remove positions doubles
	var previous = ""
	for(var i = 1; i < RackData.length; i++)
	{	
		
		previous = RackData[i-1].posId
		if ( RackData[i].posId === previous) {
			RackData.splice(i, 1); 
		  i--;
		}
	}

	// MKL sorting the data by rackTag
	RackData.sort((a,b)=>{
		if(a.posName > b.posName)
		{
			return 1
		}
		else
		{
			return -1
		}
	})

	
	let lostIsAlreadyAdded = false;
	// remove dublicates and unwanted elements
	for(var ii in RackData)
	{
		// Show Clean or unclean racks only
		if( RackData[ii].roomId == ROOMS.UNCLEAN && !showUncleanPositions) continue; // Do not show unclean positions if the unclean checkbox is not checked
		if( RackData[ii].roomId == ROOMS.CLEAN && !showCleanPositions ) continue; // Do not show clean positions if the clean checkbox is not checked		

		// Only add one Lost position to selectors.
		if ( RackData[ii].posRole == POSITION_ROLES.LOST )
		{
			if ( lostIsAlreadyAdded )
			{
				continue;
			}
			else
			{
				lostIsAlreadyAdded = true;
			}
		}

		// Save global list of positions
		g_positions[RackData[ii].posId] = RackData[ii];


		var myPosRole = ""
		switch (RackData[ii].posRole) {
			case POSITION_ROLES.ELEVATING_BUFFER:
			case POSITION_ROLES.WORKSTATION:
			case POSITION_ROLES.STERILIZER_STATION:
				myPosRole = "\uf2a7"
				break;
			
			case POSITION_ROLES.STORAGE:
				myPosRole = "\uf28b"
				break;
			case POSITION_ROLES.ON_ROBOT:
				myPosRole = "\uf63c"
				break;
			case POSITION_ROLES.LOST:
				myPosRole = "\uf059"	
				break;
			case POSITION_ROLES.WASHING_MACHINE:
			case POSITION_ROLES.REMEDA_LOADER:
				myPosRole = "\uf2cc"
				break;
			case POSITION_ROLES.RETURN:
				myPosRole = "\uf52b"
				break;
			default:

				break;
		}
		
		if( RackData[ii].posEnabled != 1 ) continue; // Do not show inactive positions

		var opt = document.createElement("option");
		opt.value = RackData[ii].posId;
		// opt.setAttribute("data-roomId",RackData[ii].roomId);

		if ( RackData[ii].posRole == POSITION_ROLES.LOST )
		{
			opt.innerHTML = GetDictionaryText('0521d37a-57be-11ea-a8bf-00ff33556161');
		}
		else if ( RackData[ii].roomId == ROOMS.STERILE )
		{	//				Hands			Role							name
			opt.innerHTML =  '\ue075' + "[" + myPosRole  + "]" + " - " + RackData[ii].posName;
			opt.setAttribute("class","dropdownOption fas")

		}
		else if ( RackData[ii].roomId == ROOMS.CLEAN )
		{	//				Hands			Role							name
			opt.innerHTML =  '\ue05d' + "[" + myPosRole  + "]" + " - " + RackData[ii].posName;
			opt.setAttribute("class","dropdownOption fas")
		}
		else if ( RackData[ii].roomId == ROOMS.UNCLEAN )
		{	//				Hands			Role							name
			opt.innerHTML = '\uf461' + "[" + myPosRole  + "]" + " - " + RackData[ii].posName;		
			opt.setAttribute("class","dropdownOption fas")
		}

		elFrom.appendChild(opt.cloneNode(true)); 		// select from should contain all positions, since the selector is disabled
		addErrorColorToPosition( RackData[ii] , opt ); 	// Add error color to position for all selectors

		if ( RackData[ii].roomId == ROOMS.STERILE )
		{
			if ( RackData[ii].posRole != POSITION_ROLES.ON_ROBOT )
			{
				sterileToPosSelectorOptions.appendChild(opt.cloneNode(true));
			}
			else
			{
				sterileRobotPosId = RackData[ii].posId;
			}
		}
		else // Clean or unclean side
		{
			if (RackData[ii].posRole == POSITION_ROLES.SERVICE)
			{
				continue;
			}
			else if (RackData[ii].posRole == POSITION_ROLES.NONE)
			{
				continue;
			}
			
			washerRoomSelectPositionManuallySelectorOptions.appendChild(opt.cloneNode(true)); 	// select manually

			disablePositionOptionifInHardError( RackData[ii] , opt ); 	// Add error color to position for all selectors

			if ( RackData[ii].posRole == POSITION_ROLES.RETURN && RackData[ii].roomId == ROOMS.CLEAN ) //show return hatches on clean side
			{
				cleanToPosSelectorOptions.appendChild(opt.cloneNode(true)); // clean side elTo options
			}
			else if(RackData[ii].posRole == POSITION_ROLES.RETURN && RackData[ii].roomId == ROOMS.UNCLEAN ) //show return hatches on unclean side
			{
				continue;
			}
			else if(RackData[ii].posRole == POSITION_ROLES.WASHING_MACHINE && RackData[ii].roomId == ROOMS.CLEAN ) //show washer on clean side
			{
				continue;
			}
			else if(RackData[ii].posRole == POSITION_ROLES.WASHING_MACHINE && RackData[ii].roomId == ROOMS.UNCLEAN ) //show washer on unclean side
			{
				uncleanToPosSelectorOptions.appendChild(opt.cloneNode(true)); // unclean side elTo options
			}
			else if( RackData[ii].posRole == POSITION_ROLES.LOST) //show lost positions
			{
				continue;
			}
			else if( RackData[ii].posRole == POSITION_ROLES.ON_ROBOT) //show robot positions
			{
				continue;
			}
			else
			{
				// SelectPosition.appendChild(opt.cloneNode(true));
				elFrom.appendChild(opt.cloneNode(true)); 	// select robot from
				addErrorColorToPosition( RackData[ii] , opt );
				if ( RackData[ii].roomId == ROOMS.CLEAN )
				{
					cleanToPosSelectorOptions.appendChild(opt.cloneNode(true)); // clean side elTo options
				}
				else // Unclean room
				{
					uncleanToPosSelectorOptions.appendChild(opt.cloneNode(true)); // unclean side elTo options
				}
			}
		}
	}

	elFrom.value = currentlySelectedFromPositionValue;
}


function addErrorColorToPosition( posInfo, opt )
{
	if ( posInfo.errorCounter >= 999 )
	{
		opt.style.backgroundColor = "#dc3545";
	}
	else if ( g_settings && g_settings.softErrorUnsuccessfulDropoffThreshold && posInfo.errorCounter >= g_settings.softErrorUnsuccessfulDropoffThreshold.onsiteValue )
	{
		opt.style.backgroundColor = "#fcf003";
	}
	else if ( posInfo.rackId )
	{
		opt.style.backgroundColor = "lightgray";
	}
}

function disablePositionOptionifInHardError ( posInfo, opt )
{
	if ( posInfo.errorCounter >= 999 )
	{
		opt.setAttribute("disabled", "true");
	}
}

let currentlySelectedFromPositionValue = null;
/** Show the Create Job Modal
 * 
 * @param {*} id 
 * @param {*} name 
 * @param {*} rackType 
 */
function ShowModal(id, name, posRole, rackType, roomId, posId, posIsMachine, rackOnRobotButtonUsed = false, defaultClientSelected = -1, currentClientName = null)
{
	$("#OrderPositionName").html(name);
	$("#create_job_rack").html(rackType + (currentClientName? ` - <i class='fas fa-users'></i> <i>${currentClientName}</i>` : ""));
	$("#OrderRackId").val(id);
	$("#OrderRackRole").val(posRole);

	var elTo = document.getElementById("moveRackToPosition");
	if ( roomId == ROOMS.UNCLEAN ) 	{ elTo.innerHTML = uncleanToPosSelectorOptions.innerHTML }
	else if ( roomId == ROOMS.CLEAN ) { elTo.innerHTML = cleanToPosSelectorOptions.innerHTML }
	else if ( roomId == ROOMS.STERILE ) { elTo.innerHTML = sterileToPosSelectorOptions.innerHTML } 
	elTo.selectedIndex = -1
	
	document.getElementById("manualMoveWasherDiv").style.display = (roomId == ROOMS.STERILE? "none" : "block");
	document.getElementById("manualMoveSterileDiv").style.display = (roomId == ROOMS.STERILE? "block" : "none");
	document.getElementById("toSterilizerProgramDiv").style.display = (roomId == ROOMS.STERILE? "block" : "none");  // Unclean side able to send to wash, or clean side at washer, ready to make emptying job.
	RevealProgramSelectorIfRemedaLoaderChosen();

	if ( roomId == ROOMS.STERILE )
	{
		$("#manualMoveRackToPosition_sterile").val(posRole == POSITION_ROLES.ON_ROBOT ? g_racks[id].sterilizerRackTableId : sterileRobotPosId);
		document.getElementById("manualMoveRackToPosition_sterile_humanReadable").value = (posRole == POSITION_ROLES.ON_ROBOT ? "table" : "robot");
	}

	if ( isMultipleClientOptionActive )
	{	// Only option is active, show client selector, when sending to wash.
		document.getElementById("toWashClientOrder").style.display = (roomId == ROOMS.UNCLEAN) || (roomId && posRole == 7) ? "block" : "none";  // Unclean side able to send to wash, or clean side at washer, ready to make emptying job.
		document.getElementById("toWashClientSelector").value = defaultClientSelected;
		document.getElementById("moveToClientSelector").value = defaultClientSelected;
	}
	document.getElementById("moveToClientOrder").style.display = "none";
	
	// Author JKA: Set corret onclick for place rack button and its back button.
	if ( rackOnRobotButtonUsed )
	{
		document.getElementById("create_job_manual").setAttribute("onclick","ManuallyMoveRack(" + posId + ", " + id + ", "  + roomId + ", " + "1, \""+ rackType + "\", true)");
	}
	else
	{
		document.getElementById("create_job_manual").setAttribute("onclick","ManuallyMoveRack(" + posId + ", " + id + ", "  + roomId + ", " + "1, \""+ rackType + "\")");
	}

	let backButton = document.getElementById("goBackButton_placeRack");
	backButton.setAttribute("onclick", "UndoMoveRackToPosition()" );
	backButton.style.opacity = 1;

	document.getElementById("create_job_manual").style.opacity = 1;
	document.getElementById("create_job_robot").style.opacity = 1;

	if ( posRole == 7 ) // 7 = Washing machine
	{
		document.getElementById("to_clean_or_hatch_label").innerHTML = GetDictionaryText('22f58a60-6cea-11ea-ac55-44e4abaa539f') // Text: "Empty machine";
		document.getElementById("to_clean_or_hatch_icon").className ="fas fa-sign-language orderRackItem";

		document.getElementById("to_clean_or_hatch_label_inner").innerHTML = GetDictionaryText('22f58a60-6cea-11ea-ac55-44e4abaa539f') // Text: "Empty machine";
		document.getElementById("to_clean_or_hatch_icon_inner").className ="fas fa-sign-language orderRackItem";
		document.getElementById("labelIQ").innerHTML = GetDictionaryText('22f985c3-6cea-11ea-ac55-44e4abaa539f') // Text: "To available work station or storage table";
	} 
	else if ( posRole == 5 ) // 5 = Return hatch
	{
		document.getElementById("to_clean_or_hatch_label").innerHTML = GetDictionaryText('22f58a60-6cea-11ea-ac55-44e4abaa539f') // Text: "Empty machine";
		document.getElementById("to_clean_or_hatch_icon").className ="fas fa-pause-circle orderRackItem";

		document.getElementById("to_clean_or_hatch_label_inner").innerHTML = GetDictionaryText('22f58a60-6cea-11ea-ac55-44e4abaa539f') // Text: "Empty machine";
		document.getElementById("to_clean_or_hatch_icon_inner").className ="fas fa-pause-circle orderRackItem";
		document.getElementById("labelIQ").innerHTML = GetDictionaryText('22fe65cd-6cea-11ea-ac55-44e4abaa539f') // Text: "To available storage table";
	}
	else if(roomId == ROOMS.CLEAN)		// MKL: change text and logo in modal to match target destination washer or return hatch
	{
		document.getElementById("to_clean_or_hatch_label").innerHTML = GetDictionaryText('b00e4a6c-ec19-11e9-8c49-00ff33556161') // Text: To return hatch "Til Retur Sluse";
		document.getElementById("to_clean_or_hatch_icon").className ="fas fa-door-open orderRackItem";


		document.getElementById("to_clean_or_hatch_label_inner").innerHTML = GetDictionaryText('b00e4a6c-ec19-11e9-8c49-00ff33556161') // Text: To return hatch "Til Retur Sluse";
		document.getElementById("to_clean_or_hatch_icon_inner").className ="fas fa-door-open orderRackItem";
		document.getElementById("labelIQ").innerHTML = GetDictionaryText('b00e4a6c-ec19-11e9-8c49-00ff33556161') // Text: To return hatch "Til Retur Sluse";
	}else if ( roomId == ROOMS.UNCLEAN )
	{
		document.getElementById("to_clean_or_hatch_label").innerHTML = GetDictionaryText('bf5fdc50-ec13-11e9-8c49-00ff33556161'); // Text: To wash // "Til Vask";
		document.getElementById("to_clean_or_hatch_icon").className ="fas fa-shower orderRackItem";

		document.getElementById("to_clean_or_hatch_label_inner").innerHTML = GetDictionaryText('bf5fdc50-ec13-11e9-8c49-00ff33556161'); // Text: To wash // "Til Vask";
		document.getElementById("to_clean_or_hatch_icon_inner").className ="fas fa-shower orderRackItem";
		document.getElementById("labelIQ").innerHTML = GetDictionaryText('bf5fdc50-ec13-11e9-8c49-00ff33556161'); // Text: To wash // "Til Vask";
	}else // Sterile room
	{
		document.getElementById("to_clean_or_hatch_label").innerHTML = GetDictionaryText('caa092b8-6d27-11eb-a60f-1c697a07f46f'); // Text: To wash // "Til Vask";
		document.getElementById("to_clean_or_hatch_icon").className ="fas fa-virus-slash orderRackItem";

		document.getElementById("to_clean_or_hatch_label_inner").innerHTML = GetDictionaryText('caa092b8-6d27-11eb-a60f-1c697a07f46f'); // Text: To wash // "Til Vask";
		document.getElementById("to_clean_or_hatch_icon_inner").className ="fas fas fa-virus-slash orderRackItem";
		document.getElementById("labelIQ").innerHTML = GetDictionaryText('caa092b8-6d27-11eb-a60f-1c697a07f46f'); // Text: To wash // "Til Vask";
	}
	

	// set the from position to be selected as default
	var elFrom = document.getElementById("moveRackFromPosition"); /** PSK Adding From list */
	for(var i=0,sL=elFrom.length;i<sL;i++){
		var myText = elFrom.options[i].textContent
		if( myText.includes(name)){
			elFrom.selectedIndex = i;
			currentlySelectedFromPositionValue = elFrom.value
		  	break;
		}
	}

	// // If position is a machine, send to wash / return hatch is not allowed
	// sendToMachineButton = document.getElementById("create_job_iq");
	// if ( posIsMachine )
	// {
	// 	sendToMachineButton.style.opacity = 0.25;
	// 	sendToMachineButton.removeAttribute("onclick");
	// }
	// else
	// {
	// 	sendToMachineButton.style.opacity = 1;
	// 	sendToMachineButton.setAttribute("onclick", "ChooseSendToIQOrder()");
	// }

	$("#rackOrderModal").modal("show");
}

// $('.li-modal').on('click', function(e){
// 	e.preventDefault();
// 	$('#bigScreenModal').modal('show').find('.modal-content').load($(this).attr('href'));
//   });

/**Author: MKL
 * This promts the user with an option menu. 
 */
function optionPromt()
{

	 $("#loginModal").modal("show");
	 $(".modal").on("shown.bs.modal", function () {
		if ($(".modal-backdrop").length > 1) {
			$(".modal-backdrop").not(':first').remove();	// remove if there are multiple modal baggrounds
		}
	})
	requestLanguageInformation()
	document.getElementById("openSelectLang").style.display = "block"; 
	document.getElementById("openTechnicalLogin").style.display = "block"; 
	document.getElementById("openAbout").style.display = "block"; 
	document.getElementById("openLicences").style.display = "block";

	// document.getElementById("flagsSelectLang").innerHTML=""
	document.getElementById("loginPassword").value = ""	// make sure that there are no prest values in the password
	document.getElementById("OptionsModal").innerHTML = ( fullDictionary.length > 0? GetDictionaryText('f7ed72e0-f0a2-11e9-b3df-00ff33556161') : "Options" );
	document.getElementById("errorMessage").style.display = "none"
	document.getElementById("btnSelectLang").style.display="none"
	document.getElementById("btnTechnicalLogin").style.display = "none"; 
	document.getElementById("btnAbout").style.display = "none"; 
	document.getElementById("btnActivateLicence").style.display = "none";
}



/**Author: MKL
 * This changes the Modal to only show the language part
 */
function openSelectLang()
{
	document.getElementById("openSelectLang").style.display = "none"; 
	document.getElementById("openTechnicalLogin").style.display = "none"; 
	document.getElementById("openAbout").style.display = "none"; 
	document.getElementById("openLicences").style.display = "none";

	document.getElementById("OptionsModal").innerHTML = ( fullDictionary.length > 0? GetDictionaryText('54e1ec3a-f0a3-11e9-b3df-00ff33556161') : "Select Language" );
	document.getElementById("errorMessage").style.display = "none"
	document.getElementById("btnSelectLang").style.display="block"
	document.getElementById("btnTechnicalLogin").style.display = "none"; 
	document.getElementById("btnAbout").style.display = "none"; 
	document.getElementById("btnActivateLicence").style.display = "none";
}

/**Author: MKL
 * This changes the Modal to only show the Login part
 */
function openTechnicalLogin()
{
	document.getElementById("openSelectLang").style.display = "none"; 
	document.getElementById("openTechnicalLogin").style.display = "none"; 
	document.getElementById("openAbout").style.display = "none"; 
	document.getElementById("openLicences").style.display = "none";

	document.getElementById("OptionsModal").innerHTML = ( fullDictionary.length > 0? GetDictionaryText('20f8fa26-ec18-11e9-8c49-00ff33556161') : "Login" );	
	document.getElementById("errorMessage").style.display = "none"
	document.getElementById("btnSelectLang").style.display="none"
	document.getElementById("btnTechnicalLogin").style.display = "block"; 
	document.getElementById("btnAbout").style.display = "none"; 
	document.getElementById("btnActivateLicence").style.display = "none";
}

/**Author: MKL
 * This changes the Modal to only show the About part
 * @todo Add more information
 */
function openAbout()
{
	simpleSocketRequest("request version numbers");
	simpleSocketRequest("request licence information");

	document.getElementById("openSelectLang").style.display = "none"; 
	document.getElementById("openTechnicalLogin").style.display = "none"; 
	document.getElementById("openAbout").style.display = "none"; 
	document.getElementById("openLicences").style.display = "none";

	document.getElementById("OptionsModal").innerHTML = ( fullDictionary.length > 0? GetDictionaryText('a79f0bd0-f0a6-11e9-b3df-00ff33556161') : "About" );
	document.getElementById("errorMessage").style.display = "none"
	document.getElementById("btnSelectLang").style.display="none"
	document.getElementById("btnTechnicalLogin").style.display = "none"; 
	document.getElementById("btnAbout").style.display = "block"; 
	document.getElementById("btnActivateLicence").style.display = "none";
	
}

/** Author JKA
 * This opens the activate licence tab in the options menu
 */
function openLicences()
{
	document.getElementById("openSelectLang").style.display = "none"; 
	document.getElementById("openTechnicalLogin").style.display = "none"; 
	document.getElementById("openAbout").style.display = "none"; 
	document.getElementById("openLicences").style.display = "none";

	document.getElementById("OptionsModal").innerHTML = ( fullDictionary.length > 0? GetDictionaryText('5ed9f30b-aae7-11ea-89f5-1c697a07f46f') : "Activate licence" );
	document.getElementById("errorMessage").style.display = "none"
	document.getElementById("btnSelectLang").style.display="none"
	document.getElementById("btnTechnicalLogin").style.display = "none"; 
	document.getElementById("btnAbout").style.display = "none"; 
	document.getElementById("btnActivateLicence").style.display = "block";
}


/**Author: MKL
 * This set the position of the client tablet
 * @todo add functionality to this. 
 */
function changePosition()
{
    var selectBox = document.getElementById("selectPositionSelector");
	var selectedValue = selectBox.options[selectBox.selectedIndex].value;
	localStorage.setItem("MyLocation", selectedValue)
	console.log(selectedValue);
	$("#loginModal").modal("hide");

}


/**Author: MKL
 * This sendt information to the server, to check the code of the user 
 */
function loginSendAuthentication()
{
	var yearcode = document.getElementById("loginPassword").value
	simpleSocketRequest( "request yearcode authentication", yearcode )
	console.log("CALL: request yearcode authentication");
	localStorage.setItem('password', yearcode);
	yearcode.value = ""
}



/**Author: MKL
 * This request the Server for information about the current robots
 * @param {Number} id The database id of the robot
 */
function getRobotInformation(id)
{
	simpleSocketRequest( "request RobotInformation", id)
}

/**Author: MKL
 * This creates a modal with the information on the robot
 * @param {*} data 
 */
function setRobotInformation(data)
{
	if(data != false)
	{	// information on the robot where recieved
		document.getElementById("RobotModalTitle").innerHTML = data[0].name

		let tempText = ( fullDictionary.length > 0? GetDictionaryText('3699a8d6-f0a2-11e9-b3df-00ff33556161') : "None" );
		var job = ""
		data[0].currentJob == null ? job = tempText :job = data[0].currentJob

		
		// document.getElementById("jobPlaceholder").innerHTML = "<i class=\"far fa-calendar fa-rotate-180\"></i> :   " + job
		document.getElementById("batteryPlaceHolder").innerHTML = "<i class=\"fas fa-battery-full\"></i> :   " + parseInt(data[0].batterySoC) + " %"
		document.getElementById("serialNumberPlaceHolder").innerHTML = "<i class=\"fas fa-hashtag\"></i> :   " + (data[0].serial_number? parseInt(data[0].serial_number) : "???");
		document.getElementById("wiFiNamePlaceHolder").innerHTML = "<i class=\"fas fa-wifi\" style=\"color: black;\"></i> :   MiR_S" + (data[0].serial_number? parseInt(data[0].serial_number.slice(data[0].serial_number.length-4)) : "???") ;
		document.getElementById("hasRackPlaceHolder").innerHTML = (data[0].hasRack?
																	("<i class=\"far fa-eye\"></i> :   " 		+ GetDictionaryText('59213d4c-56f7-11ea-a8bf-00ff33556161')) 	// Text: "Rack detected"
																   :("<i class=\"far fa-eye-slash\"></i> :   " 	+ GetDictionaryText('1d1653af-56f7-11ea-a8bf-00ff33556161')));	// Text: "No rack detected"	

		/* // Removed until functionality is made.
		var commandHolder = document.getElementById("commandHolder")
		commandHolder.innerHTML = ""
		var movebackBtn = document.createElement("button")
		movebackBtn.setAttribute("onclick", "moveRobotBackAction(\"" + data[0].id + "\");" )
		movebackBtn.classList.add("btn")
		movebackBtn.classList.add("btn-light")
		movebackBtn.classList.add("btn-block")
		movebackBtn.style.fontSize = "30px"
		movebackBtn.style.height = "60px"
		movebackBtn.innerHTML = (fullDictionary.length > 0? GetDictionaryText('de5fe3cc-e99e-11e9-ae50-00ff33556161') : "Move back" );
		commandHolder.appendChild(movebackBtn)
		var hr = document.createElement("hr")
		commandHolder.appendChild(hr)

		var GoToChargerBtn = document.createElement("button")
		GoToChargerBtn.setAttribute("onclick", "moveRobotToCharger(\"" + data[0].id + "\");" )
		GoToChargerBtn.classList.add("btn")
		GoToChargerBtn.classList.add("btn-light")
		GoToChargerBtn.classList.add("btn-block")
		GoToChargerBtn.style.fontSize = "30px"
		GoToChargerBtn.style.height = "60px"
		GoToChargerBtn.innerHTML = ( fullDictionary.length > 0? GetDictionaryText('de5fc00f-e99e-11e9-ae50-00ff33556161') : "Go charge" );
		commandHolder.appendChild(GoToChargerBtn)
		*/
	}
	else
	{	// no information could be found

	}
}

/**
 * This request the Server for status about the current robots (to know if in any errors are present)
 * @param {Number} id The database id of the robot
 */
function getRobotStatus(id)
{
	simpleSocketRequest( "request RobotStatus", id );
}

/** 
 * This function updates the robot status field to the current error, and no errors if everything is ok.
 */
function setRobotStatus(data)
{
	if ( data[0].image == "./robot-red.png" || data[0].enabled == '0' )
	{	// The robot cannot currently take jobs:
		let reason = "Unkown reason.";

		// Case 1: Robot is disabled (in service mode). This will stop the controller from running.
		if ( data[0].enabled == '0' )
		{
			reason = GetDictionaryText("8cebfcf5-4423-11ea-8c8c-b8aeed71c201"); // Text: "Service mode is active";
		}
		// Case 2: Contact have not been made with robot for more than 20 seconds.
		else if ( parseInt(data[0].lastContactTime_sec) > 20 )
		{
			reason = GetDictionaryText('8737445b-56ea-11ea-a8bf-00ff33556161'); // Text: "More than 20 seconds since contact to robot.";
		}
		// Case 3: Service mode entered into MiR
		else if ( data[0].isInServiceMode == '1' )
		{
			reason = GetDictionaryText('c46eb78d-56ea-11ea-a8bf-00ff33556161'); // Text: "Service code entered into MiR robot."
		}
		// Case 4: Robot is in emergency stop.
		else if ( data[0].status == 10 )
		{
			reason = GetDictionaryText('ec43e4a3-56ea-11ea-a8bf-00ff33556161'); // Text: "Emergency stop active.";
		}
		// Case 5: Robot is in manual control.
		else if ( data[0].status == 11 )
		{
			reason = GetDictionaryText('3a8331f8-56eb-11ea-a8bf-00ff33556161'); // Text: "Manual control is active on robot.";
		}
		// Case 6: Robot is in paused state.
		else if ( data[0].status == 4 )
		{
			reason = GetDictionaryText('e4bc85f8-56ee-11ea-a8bf-00ff33556161'); // Text: "Robot is paused."
		}
		// Case 7: Robot is in error.
		else if ( data[0].status == 12 )
		{
			reason = GetDictionaryText('5af60bd8-56eb-11ea-a8bf-00ff33556161'); // Text: "Robot is in error.";
		}
		// Case 8: Empty driptray missing in robot
		else if ( data[0].dripTrayErrorCode != '0' )
		{
			switch( data[0].dripTrayErrorCode )
			{
				case 2601:
					reason = GetDictionaryText('7dfb3cf8-56eb-11ea-a8bf-00ff33556161'); // Text: "Drip tank is missing.";
					break;
				case 2602:
					reason = GetDictionaryText('9d61059a-56eb-11ea-a8bf-00ff33556161'); // Text: "Drip tank is full.";
					break
				default:
					reason = GetDictionaryText('f18a4a0b-56eb-11ea-a8bf-00ff33556161') + data[0].dripTrayErrorCode + "."; // Text: "Drip tank error: "+ errorCode + ".";
					break;
			}
		}
		// Case 9: Robot detects rack on payload, but has no jobs. Only allowed to take jobs with robot as from position.
		else if ( data[0].hasRackAndNoJobs == '1' )
		{
			reason = GetDictionaryText('1c55ccb8-56ec-11ea-a8bf-00ff33556161'); // Text: "Robot has rack on payload.";
		}

		document.getElementById("robotStatusPlaceHolder").innerHTML = "<i class=\"fas fa-exclamation-triangle\" style=\"color: red\"></i> :   " + reason ;		
	}
	else
	{
		// No errors
		document.getElementById("robotStatusPlaceHolder").innerHTML = "<i class=\"far fa-check-circle\"></i> :   " + GetDictionaryText('acd5c71f-56ec-11ea-a8bf-00ff33556161'); // Text: "No errors."; 		
	}
}

/**
 * This request the HMI to stop the controller for the given robot, clear its mission queue, and move it to its standby position. The controller is resumed after a chosen timeout time if this option is enabled.
 * @param {Number} id database id of the robot 
 */
function moveRobotAway(id)
{
	data = {
		robotId : id,
		ipAddress : knownRobots[id].IP
	}
	simpleSocketRequest( "moveRobotAway", data );
	$("#robotModal").modal("hide");
}

/**
 * Restart the controller of the robot with the given id.
 * @param {Number} id database id of the robot 
 */
function restartRobotController(id)
{
	data = {
		robotId : id,
		ipAddress : knownRobots[id].IP
	}
	simpleSocketRequest( "restartRobotController", data );
	$("#robotModal").modal("hide");
}

/** 
 * This requests the server for error events about the current robot.
 * @param {Number} id The database id of the robot
 * @param {Number} latestErrorEventId The error event id that the following 10 error events are requested after. If null get the 10 newest error events.
 */
function getRobotErrorEvents(id, latestErrorEventIdInTable)
{
	data = {id: id, latestErrorEventIdInTable: latestErrorEventIdInTable}
	simpleSocketRequest( "request RobotErrorEvents", data);
}

function getTheNext10RobotErrorEvents(id)
{
	getRobotErrorEvents(id, latestErrorEventIdInTable);
}

var emptyErrorEventTable = document.getElementById("robot_error_events_body").innerHTML;
var latestErrorEventIdInTable = null;

/** Author JKA
 * This function fills the table with the error events returned from the server
 */
function setRobotErrorEvents(data)
{
	var tbody = document.getElementById("robot_error_events_body");
	tbody.innerHTML = "";

	var row = document.createElement("tr");

	// Error code
	var th = document.createElement("th");
	th.setAttribute("class", "text-center");
	th.setAttribute("width", "25%");
	th.innerHTML = GetDictionaryText('b8f746c0-4e68-11ea-ab96-5484fd5c1c10');
	row.appendChild(th);
	// Type
	th = document.createElement("th");
	th.setAttribute("class", "text-center");
	th.setAttribute("width", "25%");
	th.innerHTML = GetDictionaryText('0d9ddf2b-e05c-11e9-a77a-00ff33556161');
	row.appendChild(th);
	// Timestamp
	th = document.createElement("th");
	th.setAttribute("class", "text-center");
	th.setAttribute("width", "30%");
	th.innerHTML = GetDictionaryText('e5e1d2cc-4e68-11ea-ab96-5484fd5c1c10') + "";
	row.appendChild(th);
	// Rack name
	th = document.createElement("th");
	th.setAttribute("class", "text-center");
	th.setAttribute("width", "20%");
	th.innerHTML = GetDictionaryText('48e1984d-e5b9-11e9-ae50-00ff33556161');
	row.appendChild(th);

	tbody.appendChild(row);


	$('.dict_errorcode').html(GetDictionaryText('b8f746c0-4e68-11ea-ab96-5484fd5c1c10'));
	$('.dict_timestamp').html(GetDictionaryText('e5e1d2cc-4e68-11ea-ab96-5484fd5c1c10'));
	$('.dict_errorcode').html(GetDictionaryText('0d9ddf2b-e05c-11e9-a77a-00ff33556161'));

	for ( ii in data )
	{
		row = document.createElement("tr");
		row.setAttribute("height","40px");
		for (jj in data[ii])
		{
			if ( jj == "id" ) continue;

			var td = document.createElement("td");
			if ( jj == "timestamp" )
			{
				td.innerHTML = data[ii][jj];//data[ii][jj].split('T')[0] + ' ' + data[ii][jj].split('T')[1].split('.')[0];
			}
			else
			{
				td.innerHTML = data[ii][jj];
			}
			td.setAttribute("style","vertical-align:middle;");
			td.setAttribute("align","center");
			row.appendChild(td);
		}
		tbody.appendChild(row);
	}

	if ( data && data.length > 0 )
	{
		latestErrorEventIdInTable = data[data.length-1].id
	}
}

/**Author: MKL
 * This activates the robots go to charger mission
 * @param {*} robotDbId 
 */
function moveRobotToCharger(robotDbId)
{
	simpleSocketRequest("active Robot GoCharge", robotDbId)
	$("#robotModal").modal("hide");
}

/**Author: MKL
 * This activate the robots moveback mission
 * @param {*} robotDbId The robots database id
 */
function moveRobotBackAction( robotDbId)
{
	simpleSocketRequest("active Robot MoveBack", robotDbId)
	$("#robotModal").modal("hide");
}

/**Author: MKL
 * If the user is allowed to enter the technical pages are loaded
 * @param {*} yearcode  The return code from the server
 */
function loginRecieveAuthentication(yearcode=false)
{
	console.log(yearcode);
	if(yearcode)
	{
		var technicUrl =  window.location.protocol + "//" + window.location.host + "/generalsettings"	
		document.getElementById("loginPassword").value = ""
		
		var loginFunc = document.getElementById("header_login")
		loginFunc.setAttribute("onclick", "indexLogout()")

		var loginIcon = document.getElementById("glyphLogin")
		loginIcon.classList.remove("fa-sign-in-alt")
		loginIcon.classList.add("fa-sign-out-alt")


		$("#loginModal").modal("hide");
		window.open(technicUrl)
		return
	}
	else
	{
		document.getElementById("openSelectLang").style.display = "none"; 
		document.getElementById("openTechnicalLogin").style.display = "none"; 
		document.getElementById("openAbout").style.display = "none"; 
		document.getElementById("openLicences").style.display = "none";

		document.getElementById("OptionsModal").innerHTML = ( fullDictionary.length > 0? GetDictionaryText('20f8fa26-ec18-11e9-8c49-00ff33556161') : "Login" );	
		document.getElementById("errorMessage").style.display = "block"
		document.getElementById("btnSelectLang").style.display="none"
		document.getElementById("btnTechnicalLogin").style.display = "block"; 
		document.getElementById("btnAbout").style.display = "none"; 
	}
}


function indexLogout()
{
	logout() 
}


/**Author: MKL
 * This logout the user and changes the icon and function back to login 
 */
function logout() 
{
    localStorage.setItem('password', false);

	var loginFunc = document.getElementById("header_login")
	loginFunc.setAttribute("onclick", "optionPromt()")

	var loginIcon = document.getElementById("glyphLogin")
	loginIcon.classList.remove("fa-sign-out-alt")
	loginIcon.classList.add("fa-sign-in-alt")
	location.reload(true);
}

function UpdateBigScreenLicenceInfo ( licenceInfo )
{
	bigScreenLicenseActive = licenceInfo.licence_duration_left > 0;
	trialPeriodUsed = licenceInfo.trial_used;
	trialPeriodActive = licenceInfo.trial_duration_left > 0;
}

var bigScreenLicenseActive = false;
var trialPeriodUsed = true;
var trialPeriodActive = false;
/**	
 * Updates the big screen modal if the licens is active on the server. If not, a one-time 30 days trial activates the first time it is used.
 */
function UpdateBigScreenModal(info)
{
	var trialOrLicenceIsActive = bigScreenLicenseActive || trialPeriodActive;
	if ( !trialOrLicenceIsActive )
	{
		var el = document.getElementById("washStatusContainer");
		el.innerHTML = "";

		if ( !trialPeriodUsed )
		{
			document.getElementById("activateBigScreenTrial_button").style.display = "block";
			document.getElementById("washStatusScreen").style.display = "none";
			document.getElementById("trial_expired_text").style.display = "none";
			return;
		} 
		else
		{
			document.getElementById("trial_expired_text").style.display = "block";
			document.getElementById("activateBigScreenTrial_button").style.display = "none";
			document.getElementById("washStatusScreen").style.display = "none";
			document.getElementById("bigScreenButton").setAttribute("class", "fas fa-lock");
			document.getElementById("bigScreenButton").style.color = "";
			return;
		}
	}

	document.getElementById("trial_expired_text").style.display = "none";
	document.getElementById("activateBigScreenTrial_button").style.display = "none";
	document.getElementById("washStatusScreen").style.display = "block";
	
	document.getElementById("bigScreenModal_title").innerHTML = GetDictionaryText('22a00846-6dc2-11ea-ac55-44e4abaa539f');
	document.getElementById("bigScreenButton").setAttribute("class", "fas fa-shower");

	DisplayBigScreenInformationInModal(info);
}

function DisplayBigScreenInformationInModal(info)
{
	const data = $.extend(true,[],info);	// MKL copy data to new array, so we can manipulate them without changing the original
	var time = new Date(null);

	// Sorting data, so we group machines
	data.sort((a,b)=>{
		if(a.type > b.type)
		{
			return -1
		}
		else
		{
			return 1
		}
	})


	data.sort((a,b)=>{
		if(a.name > b.name)
		{
			return -1
		}
		else
		{
			return 1
		}
	})
	
	var aMachineIsInError = false;

	var el = document.getElementById("washStatusContainer");
	el.innerHTML = "";
	for(var ii in data)
	{
		var card = document.createElement("div");
		var head = document.createElement("div");
		var body = document.createElement("div");
		var foot = document.createElement("div");

		head.classList.add("washStatusHead");
		body.classList.add("washStatusTime");
		foot.classList.add("card-footer");
		card.classList.add("grid-item");

		if(data[ii].role == MACHINE_ROLE.WASHER)
		{
			head.innerHTML = "<i class=\"fas fa-shower\"></i> " + data[ii].name;
		}
		else if(data[ii].role == MACHINE_ROLE.RETURN)
		{
			head.innerHTML = "<i class=\"fas fa-door-open\"></i> " + data[ii].name;
		}
		else if(data[ii].role == MACHINE_ROLE.MONITOR)
		{
			head.innerHTML = data[ii].name;
		}

		// adding content
		if ( !data[ii].enabled )
		{	// Service mode activated (pm2 process stopped)

			/*****		BACKGROUND  	 ******/
			card.setAttribute("class", "grid-item RackStatus-OutOfService")
			// card.style.backgroundColor = "#fcf003";	
			/*****		TIME POSTITION   ******/	
			body.innerHTML = GetDictionaryText('57064fc6-57c0-11ea-a8bf-00ff33556161') + "<br>"					// Time place
			/*****		RACK POSTITION   ******/
			body.innerHTML += "<br>"					// Rackplace
			/*****		FOOTER POSTITION   ****/
			foot.innerHTML =  "<br>"					// footer place
		}
		else if(data[ii].networkConnection == 0)
		{	// No connection
			card.setAttribute("class", "grid-item RackStatus-OnRobotError")			

			body.innerHTML = "<img src='./no_network_icon.png' style='height:40px'>";	

			aMachineIsInError = true;
		}
		else if ( data[ii].isInError )
		{	// Machine is in error, but is able to be reached through rest call

			/*****		BACKGROUND  	 ******/
			card.setAttribute("class", "grid-item RackStatus-OnRobotError")
			// card.style.backgroundColor = "#dc3545";	
			/*****		TIME POSTITION   ******/	
			body.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: black"></i><br>'					// Time place
			/*****		RACK POSTITION   ******/
			body.innerHTML += "<br>"					// Rackplace
			/*****		FOOTER POSTITION   ****/
			foot.innerHTML =  "<br>"					// footer place

			aMachineIsInError = true;
		}
		else
		{	
			switch (data[ii].status) 
			{
				case MONITOR_STATE.IDLE:
					/*****		BACKGROUND  	 ******/
					card.style.backgroundColor = "whitesmoke"; 

					if (data[ii].reserved == 1) 
					{
						card.style.opacity = 0.5;
						body.innerHTML = "<img src='./robot-black.png' style='height:40px'>";
					}
					else
					{
						card.style.opacity = 1	
						/*****		TIME POSTITION   ******/
						body.innerHTML += "<br>"
						/*****		RACK POSTITION   ******/
						body.innerHTML += "<br>"
								/*****		FOOTER POSTITION   ****/
						foot.innerHTML =  "<br>"	
					}

					break;

				case MONITOR_STATE.LOADING:
					/*****		BACKGROUND  	 ******/
					card.style.backgroundImage = 'linear-gradient(to right,chartreuse 15%, whitesmoke 20%)'

					/*****		TIME POSTITION   ******/
					if (data[ii].reserved == 1) 
					{
						card.style.opacity = 0.5;
						body.innerHTML = "<img src='./robot-black.png' style='height:40px'>";
					}
					else
					{
						card.style.opacity = 1	
						body.innerHTML += "<br>"
					}

					/*****		RACK POSTITION   ******/
					body.innerHTML += "<br>"					// Rackplace
					/*****		FOOTER POSTITION   ****/
					foot.innerHTML =  "<br>"	
					break;

				case MONITOR_STATE.WORKING:

					/*****		BACKGROUND  	 ******/
					if(data[ii].role == MACHINE_ROLE.RETURN)
					{	
						card.style.backgroundImage = 'linear-gradient(to right,chartreuse 50%, whitesmoke 55%)'
					}
					else
					{
						let progress = (20 + data[ii].progress *0.6)						
						card.style.backgroundImage = 'linear-gradient(to right,chartreuse 15%, aqua 20%, aqua ' + progress + '%, whitesmoke ' + (progress+5) + '%)'
					}

					
					/*****		TIME POSTITION   ******/
					if(data[ii].role == MACHINE_ROLE.RETURN)
					{
						body.innerHTML += "<br>"
					}
					else
					{
						time = new Date(null);
						time.setSeconds(data[ii].RemainingWashTimeSec);	
						body.innerHTML = "<i class='fas fa-stopwatch'></i> " + time.toISOString().split('T')[1].substring(0,8) + "<br>"; // Convert seconds to hh:mm:ss
					}
					
					/*****		RACK POSTITION   ******/
					if(data[ii].tag == null)				// Rackplace
					{
						body.innerHTML += "<br>"
					}
					else
					{
						body.innerHTML += data[ii].tag			// Rackplace
					}
					/*****		FOOTER POSTITION   ****/
					foot.innerHTML =  "<br>"	
					break;

				case MONITOR_STATE.COMPLETED:

					/*****		BACKGROUND  	 ******/
					if(data[ii].role == MACHINE_ROLE.RETURN)
					{	
						card.style.backgroundImage = 'linear-gradient(to right,chartreuse 75%, whitesmoke 80%)'
					}
					else
					{	
						card.style.backgroundImage = 'linear-gradient(to right,chartreuse 15%, aqua 20%, aqua 80%, whitesmoke 85%)'
					}

					/*****		TIME POSTITION   ******/
					if(data[ii].role == MACHINE_ROLE.RETURN)
					{	
						body.innerHTML += "<br>"
					}
					else
					{	
						time = new Date(null);
						time.setSeconds(data[ii].RemainingWashTimeSec);	
						body.innerHTML = "<i class='fas fa-stopwatch'></i> " + time.toISOString().split('T')[1].substring(0,8) + "<br>"; // Convert seconds to hh:mm:ss
					}

					/*****		RACK POSTITION   ******/
					if(data[ii].tag == null)				
					{
						body.innerHTML += "<br>"			
					}
					else
					{
						body.innerHTML += data[ii].tag		
					}

					/*****		FOOTER POSTITION   ****/
					foot.innerHTML =  "<br>"	

					break;


				case MONITOR_STATE.UNLOADING:
					/*****		BACKGROUND  	 ******/
					if(data[ii].role == MACHINE_ROLE.RETURN)
					{	

						card.style.backgroundImage = 'linear-gradient(to right, chartreuse 100%, whitesmoke 100%)'
					}
					else
					{
						card.style.backgroundImage = 'linear-gradient(to right, chartreuse 15%, aqua 20%, aqua 80%, chartreuse 85%, chartreuse 100%)'
					}
	
					/*****		TIME POSTITION   ******/
					body.innerHTML += "<br>"					

					/*****		RACK POSTITION   ******/
					if(data[ii].tag == null)					
					{
						body.innerHTML += "<br>"
					}
					else
					{
						body.innerHTML += data[ii].tag			
					}

					/*****		FOOTER POSTITION   ****/
					foot.innerHTML =  "<br>"					
					break;
				
				case MONITOR_STATE.ERROR:
					/*****		BACKGROUND  	 ******/
					card.setAttribute("class", "grid-item RackStatus-OnRobotError")
					// card.style.backgroundColor = "#dc3545";	
					/*****		TIME POSTITION   ******/	
					body.innerHTML += "<br>"					// Time place
					/*****		RACK POSTITION   ******/
					body.innerHTML += "<br>"					// Rackplace
					/*****		FOOTER POSTITION   ****/
					foot.innerHTML =  "<br>"					// footer place
					break;
				default:
					break;
			}
		}		

		card.appendChild(head);
		card.appendChild(body);
		card.appendChild(foot);
		el.appendChild(card);	
	}

	// Color the big screen button red, if any machine is in error or cannot be reached.
	if ( aMachineIsInError )
	{
		document.getElementById("bigScreenButton").style.color = "#dc3545";
	}
	else
	{
		document.getElementById("bigScreenButton").style.color = "";
	}
}

function ActivateBigScreenTrial()
{
	simpleSocketRequest("activate big screen trial");
}

function UpdateAboutScreenWithVersions(data)
{
	
	document.getElementById("kenServer_versionNumber_label").innerHTML = `KENServer ${GetDictionaryText("aa0c95ae-abb5-11ea-89f5-1c697a07f46f")}`;		
	document.getElementById("kenServer_versionNumber").innerHTML = data.kenServerSoftwareVersion;
	document.getElementById("al10_versionNumber_label").innerHTML = `AL10 ${GetDictionaryText("aa0c95ae-abb5-11ea-89f5-1c697a07f46f")}`;		
	document.getElementById("al10_versionNumber").innerHTML = data.al10SoftwareVersion;
	robotVersionsDiv = document.getElementById("robot_versions_div");
	robotVersionsDiv.innerHTML = "";
	for (ii in data.robots)
	{
		var label = document.createElement("label");
		label.setAttribute("class","label label-info");
		label.setAttribute("for", data.robots[ii].name + data.robots[ii].c15Version);
		label.innerHTML = `C15 ${GetDictionaryText("aa0c95ae-abb5-11ea-89f5-1c697a07f46f")} (${data.robots[ii].name})`;		
		var text = document.createElement("p");
		text.setAttribute("id", data.robots[ii].name + data.robots[ii].c15Version);
		text.innerHTML = data.robots[ii].c15Version? data.robots[ii].c15Version : text.innerHTML = GetDictionaryText('f9bb350f-b21d-11ea-a81e-00ff33556161'); // Not active
		
		robotVersionsDiv.appendChild(label);
		robotVersionsDiv.appendChild(text);

		var label = document.createElement("label");
		label.setAttribute("class","label label-info");
		label.setAttribute("for", data.robots[ii].name + data.robots[ii].mirVersion);
		label.innerHTML = `MiR ${GetDictionaryText("aa0c95ae-abb5-11ea-89f5-1c697a07f46f")} (${data.robots[ii].name})`;		
		var text = document.createElement("p");
		text.setAttribute("id", data.robots[ii].name + data.robots[ii].mirVersion);
		text.innerHTML = data.robots[ii].mirVersion? data.robots[ii].mirVersion : text.innerHTML = GetDictionaryText('f9bb350f-b21d-11ea-a81e-00ff33556161'); // Not active

		robotVersionsDiv.appendChild(label);
		robotVersionsDiv.appendChild(text);
	}
}

function UpdateAboutScreenWithLicences(data)
{
	labelDurationsDiv = document.getElementById("licence_duration_div");
	labelDurationsDiv.innerHTML = "";
	for (ii in data)
	{
		var label = document.createElement("label");
		label.setAttribute("class","label label-info");
		label.setAttribute("for", data[ii].option_name);
		label.innerHTML = GetDictionaryText(data[ii].dictionary_name_guid);
		var text = document.createElement("p");
		text.setAttribute("id", data[ii].option_name);
		if ( data[ii].licence_duration_left )
		{
			text.innerHTML = `${data[ii].licence_duration_left} ${GetDictionaryText('30dcf98f-b21e-11ea-a81e-00ff33556161')}`; // Days
			if ( data[ii].option_name == "al10_client_support" )
			{
				isMultipleClientOptionActive = true;
			}
		}
		else
		{
			text.innerHTML = GetDictionaryText('f9bb350f-b21d-11ea-a81e-00ff33556161'); // Not active
		}

		labelDurationsDiv.appendChild(label);
		labelDurationsDiv.appendChild(text);
	}
}

function ActiveLicence()
{
	
}

/**  
 * Update the client selector 
 */
function UpdateClientSelector( data )
{			
	var clientToPositionSelector = document.getElementById("moveToClientSelector");
	var clientToWashSelector = document.getElementById("toWashClientSelector");
	var clientPlaceRackSelector = document.getElementById("placeRackClientSelector");
	clientToPositionSelector.innerHTML = "";
	clientToWashSelector.innerHTML = "";
	clientPlaceRackSelector.innerHTML = "";

	var opt = document.createElement("option");
	opt.value = -1;
	opt.innerHTML = ( fullDictionary.length > 0? GetDictionaryText('3699a8d6-f0a2-11e9-b3df-00ff33556161') : "None" );
	opt.setAttribute("class", "dict_none");
	clientToPositionSelector.appendChild(opt.cloneNode(true));
	clientPlaceRackSelector.appendChild(opt.cloneNode(true));
	clientToWashSelector.appendChild(opt);

	for (ii in data)
	{
		if ( !(data[ii].enabled) )
		{
			// Do not allow the user to choose disabled clients.
			continue;
		}
		opt = document.createElement("option");
		opt.value = data[ii].id;
		opt.innerHTML = data[ii].name;
		clientToPositionSelector.appendChild(opt.cloneNode(true));
		clientPlaceRackSelector.appendChild(opt.cloneNode(true));
		clientToWashSelector.appendChild(opt);
	}
}

function UpdateSterilizerProgramSelector( data )
{
	var sterilizerProgramSelectorMoveTo = document.getElementById("moveToProgramSelector");
	var sterilizerProgramSelectorToSterilizer = document.getElementById("toSterilizerProgramSelector");
	sterilizerProgramSelectorMoveTo.innerHTML = "";
	sterilizerProgramSelectorToSterilizer.innerHTML = "";

	var opt = document.createElement("option");
	
	for (ii in data)
	{
		opt = document.createElement("option");
		opt.value = data[ii].id;
		opt.innerHTML = data[ii].name;
		sterilizerProgramSelectorMoveTo.appendChild(opt.cloneNode(true));
		sterilizerProgramSelectorToSterilizer.appendChild(opt.cloneNode(true));
	}
}

function GetFullDictionaryAndUpdate(data)
{
	var langCode = localStorage.getItem("langCode");
	fullDictionary = [];
	var defaultLangauge = data.defaultLanguage;
	var dbDictionary = data.data;

	for ( var ii in dbDictionary ) {
		let word = {};
		word.guid = dbDictionary[ii].guid;
		if ( dbDictionary[ii][langCode] ) {
			word.text = dbDictionary[ii][langCode];
		} 
		else if ( dbDictionary[ii][defaultLangauge] )
		{
			word.text = dbDictionary[ii][defaultLangauge];
		}
		else {
			word.text = dbDictionary[ii].en;
		}
		fullDictionary[ii] = word; 
	}

	SetupAllTexts();
}

var g_settings;
function saveSettingsLocally(data) {
	g_settings = data;
}

/** 
 * Returns the text from fullDicitonary with matching guid.
 * @param {*} guid // guid of desired text 
 */
function GetDictionaryText(guid)
{
	let text = fullDictionary.filter(word => word.guid == guid);

	if ( text.length > 0 ) {
		return text[0].text;
	}
	else {
		console.error("Could not find text with guid: " + guid);
		return null;
	}
}

/** 
 * Setup texts with chosen language
 */
function SetupAllTexts()
{
	// Sets the text of all objects within the chosen class.
	$('.dict_racks').html(GetDictionaryText('12164e28-e517-11e9-ae50-00ff33556161'));
	$('.dict_positions').html(GetDictionaryText('12163384-e517-11e9-ae50-00ff33556161'));
	$('.dict_unclean').html(GetDictionaryText('dfe00f44-ea87-11e9-ae50-00ff33556161'));
	$('.dict_clean').html(GetDictionaryText('dfe03bca-ea87-11e9-ae50-00ff33556161'));
	$('.dict_jobqueue').html(GetDictionaryText('d247c121-ea89-11e9-ae50-00ff33556161'));
	$('.dict_createjob').html(GetDictionaryText('435af425-ea8a-11e9-ae50-00ff33556161'));
	$('.dict_toposition').html(GetDictionaryText('bf5f00f3-ec13-11e9-8c49-00ff33556161'));
	$('.dict_towash').html(GetDictionaryText('bf5fdc50-ec13-11e9-8c49-00ff33556161'));
	$('.dict_placerack').html(GetDictionaryText('5938b8f1-ec16-11e9-8c49-00ff33556161'));
	$('.dict_fromposition').html(GetDictionaryText('f8e479ea-ec16-11e9-8c49-00ff33556161'));
	$('.dict_manuallymoved').html(GetDictionaryText('9dd42106-ec17-11e9-8c49-00ff33556161'));
	$('.dict_deletejob').html(GetDictionaryText('bc4498b0-ec17-11e9-8c49-00ff33556161'));
	$('.dict_toppriority').html(GetDictionaryText('d80d03fd-ec17-11e9-8c49-00ff33556161'));
	$('.dict_login').html(GetDictionaryText('20f8fa26-ec18-11e9-8c49-00ff33556161'));
	$('.dict_wrongpassword').html(GetDictionaryText('a669a27f-ec18-11e9-8c49-00ff33556161'));

	$('.dict_commands').html(GetDictionaryText('3347b11d-f0a0-11e9-b3df-00ff33556161'));
	$('.dict_myworkposition').html(GetDictionaryText('02ae8745-f0a8-11e9-b3df-00ff33556161'));
	$('.dict_language').html(GetDictionaryText('c2507e2f-f0a8-11e9-b3df-00ff33556161'));
	$('.dict_about').html(GetDictionaryText('a79f0bd0-f0a6-11e9-b3df-00ff33556161'));
	$('.dict_posisinerror').html(GetDictionaryText('b6113fe7-6910-11ea-ac55-44e4abaa539f'));
	$('.dict_activate30daystrials').html(GetDictionaryText('feef53c6-aae6-11ea-89f5-1c697a07f46f'));
	$('.dict_activatelicence').html(GetDictionaryText('5ed9f30b-aae7-11ea-89f5-1c697a07f46f'));
	$('.dict_confirm').html(GetDictionaryText('13635987-abaf-11ea-89f5-1c697a07f46f'));
	$('.dict_softwareversion').html(GetDictionaryText('aa0c95ae-abb5-11ea-89f5-1c697a07f46f'));
	$('.dict_trialexpiredtext').html(GetDictionaryText('ea7885e4-b05a-11ea-a81e-00ff33556161'));
	$('.dict_bigscreentitle').html(GetDictionaryText('22a00846-6dc2-11ea-ac55-44e4abaa539f'));
	$('.dict_licenceoverview').html(GetDictionaryText('80f68957-b21e-11ea-a81e-00ff33556161'));
	$('.dict_none').html(GetDictionaryText('3699a8d6-f0a2-11e9-b3df-00ff33556161'));
	$('.dict_client').html(GetDictionaryText('8e50df78-e202-11ea-aeaa-1c697a0665f8'));
	$('.dict_robot').html(GetDictionaryText('45ada5bb-71c1-11eb-a60f-1c697a07f46f'));
	$('.dict_table').html(GetDictionaryText('89352008-71c1-11eb-a60f-1c697a07f46f'));
}