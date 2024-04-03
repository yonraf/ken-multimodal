/**
 * $Rev: 15777 $
 * $LastChangedDate: 2022-08-03 13:28:12 +0200 (Wed, 03 Aug 2022) $
 * $Author: jka $
 * 
 */

/* eslint no-unused-vars: ["error", {"varsIgnorePattern": "formatTime|
|hideAdminPage|hideTechOptions|showTechOptions|g_|addModal|clearAlarm|
|removeAlarmModal"}] */
// Defined in storage.js

// Defined in socket.js
/* global simpleSocketRequest displaySendToAirlockScreen displaySendToWashScreen
 displayWaitForRackScreen displayOrderRackScreen displayUserDetails 
 populateSettingTable $*/

/* Format time and date string to a human readable format */

function SetupDistributorLogo(distributor)
{  
	let distributorLogo = document.getElementById("distributorLogo");
	if ( distributorLogo )
	{
		switch ( distributor )
		{
			case "KEN" :
				distributorLogo.src = "KEN-HYGIENE-SYSTEMS-R-logo.png";
				distributorLogo.alt = "KEN Hygiene Systems";
				break;
			case "MATACHANA" :
				distributorLogo.src = "Matachana-Logo-AL10-509x103px.png";
				distributorLogo.alt = "MATACHANA";
				break;
			default :
				console.error(`Unknown distributor: ${distributor}`);
				break;
		}
	}

	let distributorLogo_small = document.getElementById("distributorLogo_small");
	if ( distributorLogo_small )
	{
		switch ( distributor )
		{
			case "KEN" :
				distributorLogo_small.href = "./KEN-brand-logo-small.png";
				break;
			case "MATACHANA" :
				distributorLogo_small.href = "./Matachana-3-Dots-32x32px.jpg";
				break;
			default :
				console.error(`Unknown distributor: ${distributor}`);
				break;
		}
	}
};

var fullDictionary = []

function GetFullDictionaryAndUpdateCommen(data)
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


function formatTime(rawTime,onlyTime=false){
	var hrTime = rawTime;
	if(rawTime.includes("T"))
	{
		hrTime = rawTime.replace("T"," ");
		hrTime = hrTime.substring(0, hrTime.length-5);
	}

	if(onlyTime)
	{
		return hrTime.split(' ')[1];
	}

	return hrTime;
}


/* Test if the terminal is on the specified page */
function isPage(page){
	return document.getElementById(page).style.display == "block";
}

// /* Test if this job belongs to the user on this terminal */
// function isThisMyJob(jobUserId){
// 	var user = getUserFromStorage();
// 	if(user == null) return false;
// 	else return (user.id == jobUserId);
// }

/* Function to print debug information to the console */
// var defineDebug = true;
// function debug(txt){
// 	if(defineDebug){
// 		console.log("DEBUG - " + txt); // eslint-disable-line
// 	}
// }

// function showAdminPage(){
// 	document.getElementById("adminPage").style.display = "block";
// 	populateSettingTable();
// }

// function hideAdminPage(){
// 	document.getElementById("adminPage").style.display = "none";
// 	clearNewUserForm();
// }

// function hideTechOptions(){
// 	document.getElementById("newUserTypeSelectTechnician").style.display = "none";
// }

// function showTechOptions(){
// 	document.getElementById("newUserTypeSelectTechnician").style.display = "block";
// }

// /** Admin can switch between rack type ordering and rack position ordering
//  * 
//  * @param {boo} state The state of the switch (checkbox)
//  */
// function SwitchRackOrdering(state)
// {
// 	if(state)
// 	{
// 		document.getElementById("orderRackByTypeDiv").style.display = "none";
// 		document.getElementById("orderRackByPositionDiv").style.display = "block";
// 	}
// 	else
// 	{
// 		document.getElementById("orderRackByPositionDiv").style.display = "none";
// 		document.getElementById("orderRackByTypeDiv").style.display = "block";
// 	}
// }

// function ShowSendToWash(cleanSide)
// {
// 	if(cleanSide)
// 	{
// 		document.getElementById("jobControlWait").style.display = "none";
// 		document.getElementById("jobControlOrderRack").style.display = "none";
// 		document.getElementById("jobControlSendToAirlock").style.display = "block";
// 		document.getElementById("jobControlSendToWash").style.display = "none";
// 	}
// 	else
// 	{
// 		document.getElementById("jobControlWait").style.display = "none";
// 		document.getElementById("jobControlOrderRack").style.display = "none";
// 		document.getElementById("jobControlSendToAirlock").style.display = "none";
// 		document.getElementById("jobControlSendToWash").style.display = "block";
// 	}
// }

// function ShowRackOrdering()
// {
// 	document.getElementById("jobControlWait").style.display = "none";
// 	document.getElementById("jobControlOrderRack").style.display = "block";
// 	document.getElementById("jobControlSendToAirlock").style.display = "none";
// 	document.getElementById("jobControlSendToWash").style.display = "none";
// }

// function ShowWaitForRack()
// {
// 	document.getElementById("jobControlWait").style.display = "block";
// 	document.getElementById("jobControlOrderRack").style.display = "none";
// 	document.getElementById("jobControlSendToAirlock").style.display = "none";
// 	document.getElementById("jobControlSendToWash").style.display = "none";
// }

// var g_mailPattern = new RegExp("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"); // eslint-disable-line
// var g_passwordPattern = new RegExp("(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"); // eslint-disable-line
// var g_ipPattern = new RegExp("^(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$"); // eslint-disable-line

/** Show an alarm */
function addModal(data){
	var exsist = document.getElementById("alarmModal" + data.id);
	if(exsist || fullDictionary.length == 0) return;
	var modalsContainer = document.getElementById("modalsContainer");
	var newModal = document.createElement("div");
	newModal.setAttribute("id","alarmModal" + data.id);
	newModal.setAttribute("class","modal fade");
	newModal.setAttribute("role","dialog");
	var modalDialog = document.createElement("div");
	modalDialog.setAttribute("class","modal-dialog modal-sm");
	modalDialog.style.width = "600px"
	var modalContent = document.createElement("div");
	modalContent.setAttribute("class","modal-content");
	modalContent.style.fontSize = "25px"
	modalContent.style.textAlign="center"
	var modalHeader = document.createElement("div");
	modalHeader.setAttribute("class","modal-header");
	modalHeader.setAttribute("style","text-align: center;");
	var modalHeading = document.createElement("h2");
	modalHeading.innerHTML = '<i class="fas fa-stopwatch"></i>';
	modalHeading.style.fontSize = "60px"
	modalHeader.appendChild(modalHeading);
	var modalBody = document.createElement("div");
	modalBody.setAttribute("class","modal-body");
	var modalTitle = document.createElement("p");
	modalTitle.innerHTML = GetDictionaryText(data.description);
	modalBody.appendChild(modalTitle);
	var modalFooter = document.createElement("div");
	modalFooter.setAttribute("class", "modal-footer");
	var btnOK = document.createElement("span");
	btnOK.setAttribute("class", "far fa-check-circle");
	btnOK.setAttribute("onclick", "clearAlarm(" + data.id + ")");
	btnOK.style.fontSize = "60px"
	btnOK.setAttribute("data-al10-lang", "");
	modalFooter.appendChild(btnOK);
	modalContent.appendChild(modalHeader);
	modalContent.appendChild(modalBody);
	modalContent.appendChild(modalFooter);
	modalDialog.appendChild(modalContent);
	newModal.appendChild(modalDialog);
	modalsContainer.appendChild(newModal);
	$("#alarmModal" + data.id).modal({backdrop: "static"});
}

function clearAlarm(alarmId){
	//var user = getUserFromStorage();
	var note = null;
	simpleSocketRequest("alarm cleared",{"id":alarmId});
}


function removeAlarmModal(alarmId){
	$("#alarmModal"+alarmId).modal("hide");
	document.getElementById("alarmModal" + alarmId).remove();
}

// function CheckLoginForAdministration()
// {
// 	if( !getUserFromStorage() )
// 	{
// 		var tmp = document.getElementsByClassName("container-fluid")[0];
// 		tmp.innerHTML = "<h1 style='text-align:center;'>Login required!</h1>";
// 		// return false;
// 		return true;   // only for development. set false when live
// 	}
// 	return true;
// }

// .unload was deprecated in version 3.0
$(window).on("unload", function(e){
    sessionStorage.clear();
});


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