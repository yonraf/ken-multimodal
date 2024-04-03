/**
 * $Rev: 10297 $
 * $LastChangedDate: 2018-05-18 15:43:37 +0200 (fr, 18 maj 2018) $
 * $Author: rup $
 * 
 * @todo Find a way to alter the server IP address in the <a href=""> in the html file. Possibly get it from the database settings
 */

$(document).ready(function(){
	socket.emit("about loaded");
});

var socket = io();

socket.on("isWindows", (isWindows) => {
	if(isWindows){
		document.getElementById("launchIdWin").style.display = true;
		document.getElementById("launchIdLin").style.display = false;
	}
	else{
		document.getElementById("launchIdWin").style.display = false;
		document.getElementById("launchIdLin").style.display = true;

	}
});

socket.on("all versions",(data) => {
	// console.log(JSON.stringify(data));
	var tbl = document.getElementById("tblVersionHistory");
	tbl.innerHTML = "";

	var thead = document.createElement("thead");
	var tbody = document.createElement("tbody");
	var row = document.createElement("tr");
	var th = null;
	
	var keys = Object.keys(data[0]);
	var first = true;
	for(var ii in keys){
		th = document.createElement("th");
		if(first) th.setAttribute("class","col-sm-4");
		else th.setAttribute("class","col-sm-2");
		first = false;
		th.innerHTML = keys[ii];
		row.appendChild(th);
	}
	thead.appendChild(row);
	for(ii in data){
		row = document.createElement("tr");
		for(var key in data[ii]){
			var cell = document.createElement("td");
			if(key=="Update time")
			{
				cell.innerHTML = formatTime( data[ii][key] );
			}
			else
			{
				cell.innerHTML = data[ii][key];
			}
			row.appendChild(cell);
		}
		tbody.appendChild(row);
	}
	tbl.appendChild(thead);
	tbl.appendChild(tbody);
});

socket.on("sql error", (error) => {
	console.log("SQL ERROR:" + JSON.stringify(error));
});

socket.on("version",(ver) => {
	var hmi = ver.HMI.SW_MAJOR + "." + ver.HMI.SW_MINOR + "." + ver.HMI.SW_PATCH + (ver.SW_LOCAL_MOD ? ("." + ver.SW_REVISION) : (""));
	var ctrl = ver.CTRL.SW_MAJOR + "." + ver.CTRL.SW_MINOR + "." + ver.CTRL.SW_PATCH + (ver.SW_LOCAL_MOD ? ("." + ver.SW_REVISION) : (""));
	var upg = ver.UPGRADER.SW_MAJOR + "." + ver.UPGRADER.SW_MINOR + "." + ver.UPGRADER.SW_PATCH + (ver.SW_LOCAL_MOD ? ("." + ver.SW_REVISION) : (""));
	var dbl = ver.DATABASE.SW_MAJOR + "." + ver.DATABASE.SW_MINOR + "." + ver.DATABASE.SW_PATCH + (ver.SW_LOCAL_MOD ? ("." + ver.SW_REVISION) : (""));	
	document.getElementById("hmiVer").innerHTML = hmi;
	document.getElementById("ctrlVer").innerHTML = ctrl;
	document.getElementById("upgVer").innerHTML = upg;
	document.getElementById("dblVer").innerHTML = dbl;
});

socket.on("upgrader", () => {
	document.getElementById("upgradeDiv").style.display = "block";
	document.getElementById("hmiServerDiv").style.display = "none";
});

socket.on("upgrade progress", (data) => {
	SetProgressBar((data.step / data.outOff) * 100);
	SetProgressText("Step " + data.step + " of " + data.outOff + " - " + data.stepName);
});

socket.on("upgrade completed", () => {
	SetProgressBar(100);
	SetProgressText("Upgrade completed. Please refresh all clients.");
})
/** Upload new software to the server in form of a zip file */
function uploadFile(){
	var ufile = document.getElementById("softwarePath").value;
	SetProgressText("Uploading new software.");

	var newSoftware = {
		imageName : ufile,
	};
	
	var file    = document.querySelector("input[type=file]").files[0]; //sames as here
	
	//------------------------
	var file = $("#upload-input").get(0).files[0];
	
	if(!fileIsSelected){
		alert("Select a file!");
		// console.log("Typeof: " + typeof(file));
		return;
	}
	
	// Create a FormData object which will be sent as the data payload in
	// the AJAX request
	var formData = new FormData();
	
	// add the files to formData object for the data payload
	formData.append("uploads[]",file, file.name);
	
	
	$.ajax({
		url: "/newSoftware",
		type: "POST",
		data: formData,
		processData: false,
		contentType: false,
		success: function(data){
			SetProgressText("File upload successfull");
			fileIsSelected = false;
			clearNewSoftwareForm();
			SetProgressBar(1/7);
			socket.emit("do a complete upgrade");
		}
		
	});	
	// clearNewSoftwareForm();
}

/** Set the text above the progress bar
 * @param {string} val What to write
 */
function SetProgressText(val){
	document.getElementById("progressText").innerHTML = val;
}

/** Clear the file selector input */
function clearNewSoftwareForm(){
	document.getElementById("softwarePath").value = "";
	document.getElementById("btnUploadFile").disabled = true;
	document.getElementById("btnClearUploadForm").disabled = true;
}

/** Enable the file upload button */
function EnableUpload(){
	document.getElementById("btnUploadFile").disabled = false;
	document.getElementById("btnClearUploadForm").disabled = false;
}

var fileIsSelected =false;

/* We can attach the `fileselect` event to all file inputs on the page */
$(document).on("change", "#upload-input", function(evt){
	var file = $(this).get(0).files[0].name;
	
	document.getElementById("softwarePath").value = file;
	// console.log(file)
	// previewFile();
	SetProgressBar(0);
	EnableUpload();
	fileIsSelected = true;
});

function downloadDb(){
	document.getElementById("downloadLink").click();
	document.getElementById("downloadCheck").style.display = "block";
}


var timer = null;

/** Set the value of the progress bar
 * @param {number} val The integer value in percent [0..100]
 */
function SetProgressBar(val){
	if(val < 0 || val > 100){
		return;
	}
	document.getElementById("progressbar").style.width = val + "%";
}


/** Developmental functions to call the individual processes */
function CreateBackup(){
	socket.emit("create backup");
}

function StopServices(){
	socket.emit("stop services");
}

function UnpackFiles(){
	socket.emit("unpack files");
}

function UpdateDatabase(){
	socket.emit("update database");
}

function RestartServices(){
	socket.emit("restart services");
}

function UpdateVersionHistory(){
	socket.emit("update version");
}

socket.on("dev response", (resp) => {
	alert(resp);
});