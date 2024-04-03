/**
 * $Rev: 14112 $
 * $LastChangedDate: 2021-04-26 12:30:23 +0200 (Mon, 26 Apr 2021) $
 * $Author: jka $
 * 
 * Handles displaying the job queue and queue management
 */

/* eslint no-unused-vars: ["error", {"varsIgnorePattern": "updateQueue|
   |deleteJob|cancelRack|IncrementJobPriority|placeRackPositionOrder|
   |placeRackTypeOrder|sendRackToWash|sendRackToAirlock|returnRackToBuffer"}] */

/* global setPayloadStatusImg  */
/* global simpleSocketRequest */

var fullDictionary = [];

var deletedJobs = [];	// used for when setting jobs to be deleted

function UpdateQueue(data){
	const JobData = $.extend(true,[],data); // MKL copy data to new array, so we can manipulate them without changing the original

	// JobData.sort((a,b)=>{
	// 	if(a.do_job > b.do_job) return -1
	// 	if(a.do_job < b.do_job) return 1

	// 	if (a.priority > b.priority) return -1;
	// 	if (a.priority < b.priority) return 1;

	// 	if (a.id > b.id) return 1;
	// 	if (a.id < b.id) return -1;
	// })

	var el1 = document.querySelector("#queueTableDiv");
	el1.innerHTML = "";
	
	var dataLength = JobData.length;
	
	if(dataLength == 0){
		return;
	}

	var showCleanJobs = document.getElementById("select_side_clean_cb").checked;
	var showUncleanJobs = document.getElementById("select_side_unclean_cb").checked;
	var showSterileJobs = document.getElementById("select_side_sterile_cb").checked;

	for(var ii = 0 ; ii < dataLength ; ii++){
		var showJob = true;
		var progressSrc = "";
		
		if( !showCleanJobs && JobData[ii].roomId == ROOMS.CLEAN ) continue; 		// Skip if this is a clean job and we should not show the clean jobs
		if( !showUncleanJobs && JobData[ii].roomId == ROOMS.UNCLEAN ) continue;	// Skip if this is an unclean job and we should not show the unclean jobs
		if( !showSterileJobs && JobData[ii].roomId == ROOMS.STERILE ) continue;
		


		// Get the job status and set various control variables
		switch(JobData[ii]["status"]){
		case 1:// Queued
			progressSrc = "";
			break;
		case 2:// Job is accepted and the robot is driving to the pickup position
			progressSrc = "./completed1.png";
			break;
		case 3:// The robot is picking up the payload
			progressSrc = "./completed2.png";
			break;
		case 4:// The robot is in transit with the payload
			progressSrc = "./completed3.png";
			break;
		case 5:// The robot is dropping the payload off at the dropoff position
			progressSrc = "./completed4.png";
			break;
		case 7:// The job is aborted and the robot is returning the payload to the pickup position
			showJob = false;
			break;
		default: // This should never occur... Status 6 (Completed), 8 (Aborted), 9 (Failed), and 10 (Deleted) are all filtered away using the jobqueue view.
			showJob = false;
			break;
		}
		
		if(!showJob){continue;}
		
		// Create and setup the table
		var table = document.createElement("table"), row, cell;
		table.setAttribute("id","job " + JobData[ii].id); // Add job id
		table.classList.add("queue");

		table.setAttribute("onclick","ShowJobModal(" + JobData[ii].id + ", " + JobData[ii].status + ", \"" + JobData[ii].rackTag + " - " + JobData[ii].rackType + "\", " + JobData[ii].roomId + ")" );
	


		// Row 1 - Rack Type
		row = table.insertRow(0);
		cell = row.insertCell(0);
		cell.setAttribute("style", "text-align: center");
		cell.setAttribute("class","col-xs-2");
		cell.setAttribute("data-al10-lang", "");
		cell.innerHTML = "<i class='far fa-calendar fa-rotate-180'></i>";
		row.appendChild(cell);
		
		// Column 2 - Texts
		cell = row.insertCell(0);
		// cell.setAttribute("class","col-xs-8");


		if(JobData[ii].conflict == 1)
		{
			cell.innerHTML = JobData[ii].rackTag + " - " + JobData[ii].rackType + "<i class=\"fas fa-exclamation-triangle blink\"></i>";
		}
		else
		{
			cell.innerHTML = JobData[ii].rackTag + " - " + JobData[ii].rackType 
		}

		row.appendChild(cell);
		
		// Column 3 - Priority and delete
		cell = document.createElement("td");
		cell.setAttribute("class","col-xs-1");
		// cell.style.width = "80px";
		cell.style.textAlign = "center";
		// cell.setAttribute("style","text-align: center");
		var tblPriority = document.createElement("span");
		// tblPriority.setAttribute("class","fas fa-chevron-up");
		tblPriority.style.fontSize = "35px";

		cell.appendChild(tblPriority);
		row.appendChild(cell);

		// Column 4 - Progress bar
		cell = document.createElement("td");
		cell.setAttribute("class","col-xs-1");
		cell.setAttribute("rowspan","3");
		var img = document.createElement("img");
		img.setAttribute("src",progressSrc);
		img.style.transform = "rotate(-90deg)";
		img.style.width = "90px";
		if(JobData[ii]["status"] < 2 && JobData[ii]["status"] > 5)
		{
			img.style.display = "none";
		}
		cell.appendChild(img);
		row.appendChild(cell);

		table.appendChild(row);
		
		// Row 2 - Pickup
		row = document.createElement("tr");
		
		// Column 1 - Icons
		cell = document.createElement("td");
		cell.setAttribute("style","text-align: center");
		cell.innerHTML = "<i class='fas fa-map-marker-alt'></i><i class='fas fa-long-arrow-alt-right'></i>";
		row.appendChild(cell);
		
		// Column 2 - Texts
		cell = document.createElement("td");
		if(JobData[ii].pickupPosition) cell.innerHTML = JobData[ii].pickupName;
		else if(JobData[ii].alternateDropoffPosition) cell.innerHTML = "<span class='glyphicon glyphicon-random'></span> " + JobData[ii].alternateDropoffName;
		else cell.innerHTML = "";
		row.appendChild(cell);
		table.appendChild(row);

		// Column 3 - Priority and delete
		cell = document.createElement("td");
		
		cell = document.createElement("td");
		cell.setAttribute("style","text-align:center");
		var tblDelete = document.createElement("span");
		tblDelete.style.fontSize = "35px";
		cell.setAttribute("rowspan","2");
		tblDelete.setAttribute("id","deleteIcon" + JobData[ii].id)

		if(deletedJobs.includes(JobData[ii].id))
		{
			tblDelete.setAttribute("class","fas fa-sync fa-spin")
		}

		cell.appendChild(tblDelete);
		row.appendChild(cell);

		// Row 3 - Destination
		row = document.createElement("tr");
		
		// Column 1 - Icons
		cell = document.createElement("td");
		cell.setAttribute("style","text-align: center");
		cell.innerHTML = "<i class='fas fa-long-arrow-alt-right'></i><i class='fas fa-map-marker-alt'></i>";
		row.appendChild(cell);
		
		// Column 2 - Texts
		cell = document.createElement("td");
		if(JobData[ii].dropoffPosition) cell.innerHTML = JobData[ii].dropoffName;
		else if(JobData[ii].alternateDropoffPosition) cell.innerHTML = "<span class='glyphicon glyphicon-random'></span> " + JobData[ii].alternateDropoffName;
		else cell.innerHTML = "";
		row.appendChild(cell);
		
		table.appendChild(row);

		// Row 4 - Client (optional)
		if ( JobData[ii].clientName )
		{
			row = document.createElement("tr");
			// Columne 1 - Icons
			cell = document.createElement("td");
			cell.setAttribute("style","text-align: center");
			cell.innerHTML = "<i class='fas fa-users'></i>";
			row.appendChild(cell);
			// Column 2 - Texts
			cell = document.createElement("td");
			cell.setAttribute("colspan", "2");
			row.appendChild(cell);
			cell.innerHTML = JobData[ii].clientName;
			row.appendChild(cell);
			table.appendChild(row);
		}
		// Collumn 1 - Icons

		// Row 5 - Information
		row = document.createElement("tr");
		// Collumn 1 - Icons
		cell = document.createElement("td");
		cell.setAttribute("style","text-align: center");
		cell.innerHTML = "<i class='fas fa-info-circle'></i>";
		row.appendChild(cell);

		// Column 2 - Texts
		cell = document.createElement("th");
		// cell.setAttribute("style","text-align: center");
		cell.setAttribute("colspan","2");
		row.appendChild(cell);

		if(JobData[ii].waitingCode) {
			let waitingText = GetDictionaryText(JobData[ii].waitingCode);
			if ( JobData[ii].waitingTarget )
			{
				waitingText = waitingText.replace("@@@", JobData[ii].waitingTarget);
			}

			cell.innerHTML += waitingText;

			row.appendChild(cell);
			table.appendChild(row);
		}
		
		el1.appendChild(table);
	}
}

/**
 * This displays the Modal for jobs and sets the actions for the buttons
 */
function ShowJobModal(id, jobStatus, rackName, roomId)
{
	$("#job_modal_rack_name").html(rackName);
	$("#OrderJobId").val(id);

		
	document.getElementById("deleteJobManually").style.opacity = 1;
	document.getElementById("jobPriority").style.opacity = 1;

	var deletejob = document.getElementById("deleteJobManually");
	var highPriority = document.getElementById("jobPriority");
	var doneManually = document.getElementById("finishJobManually");

	if ( roomId == ROOMS.STERILE && jobStatus >= 5 )
	{	// No longer possible to delete sterile job, if already in the middle of dropoff.
		deletejob.style.opacity = 0.25;
		deletejob.removeAttribute("onclick");
	}
	else
	{
		deletejob.style.opacity = 1;
		deletejob.setAttribute("onclick","deleteJob(" + id + ")");
	}

	highPriority.setAttribute("onclick","IncrementJobPriority(" + id + ")");

	// When jobStatus is no longer queued, it is not allowed to use the "moved_manually"-functionality.
	if ( jobStatus != 1 || roomId == ROOMS.STERILE )
	{
		doneManually.style.opacity = 0.25;
		doneManually.removeAttribute("onclick");
	}
	else
	{
		doneManually.style.opacity = 1;	
		doneManually.setAttribute("onclick","finishJobManually(" + id + ")");
	}

	$("#jobQueueModal").modal("show");
}


var deleteJobDoubleLock = false;
var priorityJobDoubleLock = false;
/** The user wants to delete a job that is not being serviced 
 * @param id The id of the job to delete
 */
function deleteJob(id){

	deletedJobs.push(id)
	if(deleteJobDoubleLock){
		alert("NO DOUBLE CLICK!!");
		return;
	}
	deleteJobDoubleLock = true;
	setTimeout(()=>{
		deleteJobDoubleLock = false;
	},1000);
	$("#jobQueueModal").modal("hide");	
	simpleSocketRequest("deleteJob 2.0",id);

}

/** The user wants to change the priority of a job */
function IncrementJobPriority(id){
	if(priorityJobDoubleLock){
		alert("NO DOUBLE CLICK!!");
		return;
	}
	priorityJobDoubleLock = true;
	setTimeout(()=>{
		priorityJobDoubleLock = false;
	},1000);
	$("#jobQueueModal").modal("hide");
	simpleSocketRequest("increment job priority 2.0", id);
}

/**Author: MKL
 * This deletes the job and promt the user for the new position
 * 
 * @param {*} id 
 */
function finishJobManually(id){
	$("#jobQueueModal").modal("hide");
	simpleSocketRequest("Job Done Manually", id);
}


/**PSK */
/** Order rack modal shows the "Move rack fromo" selector */
function MoveRackFromPosition()
{
	document.getElementById("orderType").style.display = "none";
	document.getElementById("moveFromOrder").style.display = "block";
	document.getElementById("manualOrder").style.display = "none";
	document.getElementById("washOrder").style.display = "none";
}

/** Order rack modal shows the "Move rack to" selector */
function MoveRackToPosition()
{
	document.getElementById("orderType").style.display = "none";    //To Wash
	document.getElementById("moveToOrder").style.display = "block"; // top position
	document.getElementById("manualOrder").style.display = "none"; // Move manually
	document.getElementById("moveFromOrder").style.display = "block"; // From Position
	document.getElementById("washOrder").style.display = "none";
}

/** Order rack modal returns to the "order type" page */
function UndoMoveRackToPosition()
{
	document.getElementById("createJobTitle").innerHTML = (fullDictionary.length > 0? GetDictionaryText('435af425-ea8a-11e9-ae50-00ff33556161') : "Create job"); 

	document.getElementById("orderType").style.display = "block";
	document.getElementById("moveToOrder").style.display = "none";
	document.getElementById("manualOrder").style.display = "none";
	document.getElementById("moveFromOrder").style.display = "none"; // From Position
	document.getElementById("washOrder").style.display = "none";
}


function SelectElement(id, valueToSelect)
{    
    var element = document.getElementById(id);
    element.value = valueToSelect;
}

var lostButtonUsedForManualMove = false;
/** Order rack modal shows the "Move rack to" selector */
function ManuallyMoveRack(posId, rackId, roomId, isAllowedToGoBack, rackName, wasLostButtonUsed = false, showClientSelector = false, currentClient = -1, sterilizerRackTableId = null)
{
	document.getElementById("createJobTitle").innerHTML = (fullDictionary.length > 0? GetDictionaryText('5938b8f1-ec16-11e9-8c49-00ff33556161') : "Place rack"); 

	document.getElementById("placeRackClientOrder").style.display = showClientSelector? "block" : "none";
	document.getElementById("placeRackClientSelector").value = currentClient;

	lostButtonUsedForManualMove = wasLostButtonUsed;
	
	document.getElementById("manualMoveWasherDiv").style.display = (roomId == ROOMS.STERILE? "none" : "block");
	document.getElementById("manualMoveSterileDiv").style.display = (roomId == ROOMS.STERILE? "block" : "none");
	
	if ( sterilizerRackTableId )
	{
		$("#manualMoveRackToPosition_sterile").val(sterilizerRackTableId);
		document.getElementById("manualMoveRackToPosition_sterile_humanReadable").value = "table";
	}

	if ( isAllowedToGoBack == 0 )
	{
		let backButton = document.getElementById("goBackButton_placeRack");
		backButton.removeAttribute("onclick");
		backButton.style.opacity = 0.25;
	}
	$("#create_job_rack").html(rackName);

	// set the from position to be selected as default
	document.getElementById("manualMoveRackToPosition").value = posId
	$("#OrderRackId").val(rackId);

	//if(!sessionStorage.getItem("robot_paused")) return;
	document.getElementById("orderType").style.display = "none"; 
	document.getElementById("moveToOrder").style.display = "none"; 
	document.getElementById("moveFromOrder").style.display = "none";	
	document.getElementById("manualOrder").style.display = "block";
	document.getElementById("washOrder").style.display = "none";
	$("#rackOrderModal").modal("show");
}

// /** 
//  * 
//  */
// function showChoosePositionForRackModal(posAndRobotInfo)
// {
// 	document.getElementById("createJobTitle").innerHTML = (fullDictionary.length > 0? GetDictionaryText('5938b8f1-ec16-11e9-8c49-00ff33556161') : "Place rack"); 
// 	document.getElementById("create_job_rack").innerHTML = "<i>" + posAndRobotInfo.robotName + "</i> attempted to pick up <i>" + posAndRobotInfo.rackName + "</i>.\nChoose current position of the rack from the list." //(fullDictionary.length > 0? GetDictionaryText('5938b8f1-ec16-11e9-8c49-00ff33556161') : "Place rack"); 

// 	// Disable back button.
// 	let backButton = document.getElementById("goBackButton_placeRack");
// 	backButton.removeAttribute("onclick");
// 	backButton.style.opacity = 0.25;

// 	$("#OrderRackId").val(posAndRobotInfo.rackId);

// 	document.getElementById("orderType").style.display = "none"; 
// 	document.getElementById("moveToOrder").style.display = "none"; 
// 	document.getElementById("moveFromOrder").style.display = "none";	
// 	document.getElementById("manualOrder").style.display = "block";
// 	document.getElementById("washOrder").style.display = "none";
// 	$("#rackOrderModal").modal("show");
// }

function ShowPositionWithUnknownRackModal( posName ) 
{
	simpleSocketRequest("request rackdetails");

	// var posName = "Buffer02";
	var title = GetDictionaryText('c4377461-9e75-11eb-85ed-1c697a0665f8').replace("@@@", posName); // "Unkown rack on @@@"
	document.getElementById("positionWithUnknownRack_title").innerHTML = title;
	var text = GetDictionaryText('ed709725-9e75-11eb-85ed-1c697a0665f8').replace("@@@", posName).replace("@@@", posName); // "The robot unsuccessfully attempted to deliver a rack to position @@@. Choose which rack is currently placed on position @@@. If no rack is present, call for technical assistance to find the error cause."
	document.getElementById("positionWithUnknownRack_text").innerHTML = text;
	var label = GetDictionaryText('5ef54e7c-9e76-11eb-85ed-1c697a0665f8').replace("@@@", posName); // "Choose rack located on position @@@"
	document.getElementById("unkownRackSelector_label").innerHTML = label; 
}

function HidePositionWithUnknownRackModal()
{
	$("#positionWithUnknownRackModal").modal("hide");
}

function UpdateRackSelector ( rackdetails )
{
	var rackSelector = document.getElementById("unkownRackSelector_select");
	rackSelector.innerHTML = "";
	var opt = document.createElement("option");
	opt.setAttribute("value", -1);
	opt.innerHTML = GetDictionaryText('bdf541d6-9e96-11eb-85ed-1c697a0665f8'); // "No rack";
	rackSelector.appendChild(opt);
	
	while(rackdetails.length > 0){
		opt = document.createElement("option");
		rack = rackdetails.pop();
		
		if ( rack.posName == "Service" || rack.rackType == "1" )
			continue;

		opt.setAttribute("value",rack.rackId);
		opt.innerHTML = rack.rackTag;
		rackSelector.appendChild(opt);
	}

	$("#positionWithUnknownRackModal").modal("show");
}

function SubmitPositionWithUnknownRack()
{
	var data = 
	{
		posId 	: document.getElementById("positionInError_posId").value,
		rackId 	: document.getElementById("unkownRackSelector_select").value
	}

	console.log(data);

	simpleSocketRequest("reset position soft error and place rack", data);

	$("#positionWithUnknownRackModal").modal("hide");
}

/** Order rack modal shows the "Move rack to" selector */
function ChooseSendToIQOrder()
{
	//if(!sessionStorage.getItem("robot_paused")) return;
	document.getElementById("orderType").style.display = "none"; 
	document.getElementById("moveToOrder").style.display = "none"; 
	document.getElementById("moveFromOrder").style.display = "block";	
	document.getElementById("washOrder").style.display = "block";
}

/** Command the robot to move a rack from its position to the desired position */
function PlaceMoveRackOrder()
{
	var tmpClient = -1;
	if ( document.getElementById("moveToClientOrder").style.display == "block" )
	{	// Selector is hidden, if it is not a washer, or the option is not enabled.
		tmpClient = document.getElementById("moveToClientSelector").value == -1 ? null : document.getElementById("moveToClientSelector").value;
	}

	var payload = {
		rack : parseInt(document.getElementById("OrderRackId").value),		
		to   : parseInt(document.getElementById("moveRackToPosition").value),
		from : parseInt(document.getElementById("moveRackFromPosition").value), /**PSK */
		client : tmpClient,
		sterilizerProgramId : (document.getElementById("moveToProgramDiv").style.display == "block" ? parseInt(document.getElementById("moveToProgramSelector").value) : null),
	};
	simpleSocketRequest("move rack order 2.0", payload); /** PSK send */
	$("#rackOrderModal").modal("hide");
	document.getElementById("moveRackToPosition").selectedIndex = -1;
}

/** Command the robot to move a rack from its current position to a washing machine or return hatch */
function PlaceSendToIQOrder()
{
	var tmpClient = -1;
	if ( document.getElementById("toWashClientOrder").style.display == "block" )
	{	// Selector is hidden, if it is not a washer, or the option is not enabled.
		tmpClient = document.getElementById("toWashClientSelector").value == -1 ? null : document.getElementById("toWashClientSelector").value;
	}

	var payload = {
		rack : document.getElementById("OrderRackId").value,
		from : parseInt(document.getElementById("moveRackFromPosition").value),
		client : tmpClient,
		sterilizerProgramId : (document.getElementById("toSterilizerProgramDiv").style.display == "block" ? parseInt(document.getElementById("toSterilizerProgramSelector").value) : null),
	};

	if ( document.getElementById("OrderRackRole").value == POSITION_ROLES.WASHING_MACHINE || document.getElementById("OrderRackRole").value == POSITION_ROLES.RETURN )
	{
		simpleSocketRequest( "send empty iq 2.0", payload ); // Recreate emptying job from IQ machine (washer / return)
	}
	else
	{
		simpleSocketRequest( "send rack to iq 2.0", payload ); /** Send rack to IQ machine (washer / return) */
	}
	$("#rackOrderModal").modal("hide");
}

/** Inform the system that a rack has been moved manually to a new position */
function HandleRackMaually()
{
	let tmpClient =  -1;
	if ( document.getElementById("placeRackClientOrder").style.display == "block" )
		tmpClient = document.getElementById("placeRackClientSelector").value == -1? null : document.getElementById("placeRackClientSelector").value

	var payload = {
		rack 	: parseInt(document.getElementById("OrderRackId").value),
		to 		: (document.getElementById("manualMoveWasherDiv").style.display == "block" ? parseInt(document.getElementById("manualMoveRackToPosition").value) : parseInt(document.getElementById("manualMoveRackToPosition_sterile").value)), /**PSK */	
		client 	: tmpClient
	};
	if ( lostButtonUsedForManualMove )
	{
		payload.lostButtonUsed = true;
	}

	simpleSocketRequest( "handle rack manually 2.0", payload );
	$("#rackOrderModal").modal("hide");
}

$("#rackOrderModal").on("hidden.bs.modal", () => {
	UndoMoveRackToPosition();
});


function GetFullDictionaryAndUpdateQueue(data)
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