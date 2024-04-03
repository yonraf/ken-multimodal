/**
 * $Rev: 15777 $
 * $LastChangedDate: 2022-08-03 13:28:12 +0200 (Wed, 03 Aug 2022) $
 * $Author: jka $
 * 
 */

// g_settings is a global variable, simpleSocketRequest is a function used globaly
/* eslint no-unused-vars: ["error", {"varsIgnorePattern": "g_settings|simpleSocketRequest"}]*/
// Defined in *.js
/* global io $ updateSettingsHMI clearOrderedRack updateQueue updateQueueNoUser 
 */
var socket = io();

/* Sending data from external javascript files */
function simpleSocketRequest(req,data=null){
	socket.emit(req,data);
}

socket.on("reload main page", () => {
	location.reload(true);
});

socket.on("server updated", () => {
	location.reload(true);
});

/* queue */
socket.on("queue",function(data){
	UpdateQueue(data);
});


/* List of all positions and their associated racks */
socket.on("rack update",function(data){ 
	PopulateRackOrders(data); // index.js
	SetupAllTexts();
});

socket.on("position selection",function(data){ 
	//PopulateRackOrders(data); // index.js
	PopulateOrderPositionSelector(data); // index.js
	SetupAllTexts();	
});


socket.on("response distributor", (distributor) => {
	SetupDistributorLogo(distributor);
});

socket.on("alarm",function(data){
	for(var ii in data){
		addModal(data[ii]); // common.js
	}
});

// /**Author: MKL
//  * This reactes to the langauge code response and sets the data
//  */
// socket.on("response standard Language",(data)=>
// {
// 	setClientLang(data)
// });

socket.on("responce logout", ()=>{
	console.log("Call: responce logout");
	
	indexLogout()
})
	
socket.on("clear alarm",function(data){
	removeAlarmModal(data); // common.js
});

socket.on("device error", (data) => {
	NewAlerts(data);
});

socket.on("event cleared", (uuid) => {
	ClearEvent(uuid);
});

socket.on("robot status update", (data) => {
	UpdateRobotStatus(data);
});

function Help(langId)
{
	socket.emit("get help dialog",langId);
}

socket.on("help return", (data) => {
	alert(data.text);
});

/**Author: MKL
 * This response on the socket call and calls the approiate function
 */
socket.on("response yearcode authentication", (data) => {
	loginRecieveAuthentication(data)
});



/**Author: MKL
 * This response on the socket call and calls the approiate function
 */
socket.on("response RobotInformation", (data)=>{
	setRobotInformation(data)
});

/**
 * Regarding robots tatus on a specific robot.
 */
socket.on("response RobotStatus", (data)=>{
	setRobotStatus(data)
});


/** 
 * Reponse regarding error events on a specific robot.
 */
socket.on("response RobotErrorEvents", (data) => {
	setRobotErrorEvents(data);
});

socket.on("dictionary send", (data) => {
	GetFullDictionaryAndUpdate(data);	// This is for index 2.0
	GetFullDictionaryAndUpdateCommen(data);	// This is for commen.js
	GetFullDictionaryAndUpdateQueue(data); // This is for queue-2-0.js
});

socket.on("Update jobInfo", (data) => {
	UpdateKenInfo(data)
});


socket.on("database offline", () => {
	databaseOffline()
});

socket.on("response settings", (data) => {
	saveSettingsLocally(data);
});

socket.on("response rackdetails", (data) => {
	UpdateRackSelector( data );
});

socket.on("big screen wash update", (data) => {
	UpdateBigScreenModal( data );
});

socket.on("big screen licence info", (data) => {
	UpdateBigScreenLicenceInfo( data );
});

socket.on("response version numbers", (data) => {
	UpdateAboutScreenWithVersions( data );
});

socket.on("response licence information", (data) => {
	UpdateAboutScreenWithLicences( data );
});

socket.on("client setup response", (data) => {
	UpdateClientSelector( data );
});

socket.on("active rooms return", (data) => {
	ActivateSterileRoomIfLicenseActive( data );
});

socket.on("sterilizer program broadcast", (data) => {
	UpdateSterilizerProgramSelector( data );
});

// /** 
//  * Socket response from controller, when error 3401 (Rack Safety Switch Forward) triggers. 
//  * To resolve this error, a modal is shown, which asks user what is placed on the position the robot was trying to dropoff rack to. 
//  */
// socket.on("error 3403 triggered", posAndRobotInfo => {
// 	showChooseRackForPositionModal(posAndRobotInfo);
// });

// /** 
//  * Socket response from controller, when error 3703 (Rack not loaded) triggers. 
//  * To resolve this error, a modal is shown, which asks user where the rack that the robot tried to pick up is actually placed. 
//  */
// socket.on("error 3703 triggered", rackAndRobotInfo => {
// 	showChoosePositionForRackModal(rackAndRobotInfo);
// });