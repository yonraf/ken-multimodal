/**
 * Device alerts
 * $Rev: 14084 $
 * $LastChangedDate: 2021-04-15 11:18:35 +0200 (Thu, 15 Apr 2021) $
 * $Author: jka $
 * 
 * Handle alerts/errors from robots, washing machines and active buffer tables
 * and generate a popup on the user screen if they need to take action
 */

/** Check if the event is already saved in the session storage
 * 
 * @param {string} uuid The event identifier
 * @returns {boolean} True if the event is already stored
 */
function CheckAlertInSessionStorage(uuid)
{
	return sessionStorage.getItem(uuid);
}

/** Save the alert in session storage
 * 
 * @param {string} uuid The event identifier
 * @param {object} data The event data
 */
function SetAlertToStorage(uuid, data)
{
	sessionStorage.setItem(uuid, JSON.stringify(data) );
}

/** New alerts pushed from the server
 * 
 * @param {Array} data 
 */
function NewAlerts(data)
{
	for ( var ii in data )
	{
		// Do not show error events for the de-selected rooms
		if ( data[ii].roomId == null || (data[ii].roomId == 1 && document.getElementById("select_side_clean_cb").checked) ||  (data[ii].roomId == 0 && document.getElementById("select_side_unclean_cb").checked) || (data[ii].roomId == 2 && document.getElementById("select_side_sterile_cb").checked) )
		{
			if( !CheckAlertInSessionStorage( data[ii].uuid ) )
			{
				if ( CreateModal(data[ii]) )
				{
					SetAlertToStorage( data[ii].uuid, data[ii] );
				}
			}
		}
	}
}

/** Create and display a modal popup on the user interface
 * 
 * @param {object} data 
 * @param {boolean} btnIgnoreUserLogin If true, the alert should be displayed, regardles of no user being logged in 
 * @returns {boolean} True if the modal was created
 */
function CreateModal(data)
{
	var mainBody = document.body;

	var newModal = document.createElement("div");
	var modalDialog = document.createElement("div");
	var modalContent = document.createElement("div");
	var modalHeader = document.createElement("div");
	var modalHeading = document.createElement("h3");
	var modalBody = document.createElement("div");
	var modalText = document.createElement("p");
	var modalComment = document.createElement("textarea");
	var modalCommentLabel = document.createElement("label");
	var modalFooter = document.createElement("div");
	var btnOK = document.createElement("button");
	var btnManFix = document.createElement("button");
	var btnAbort = document.createElement("button");
	var btnIgnore = document.createElement("button");
	var btnHelp = document.createElement("button");
	var str = "";
	if(data.robotId)
	{
		str = "Robot [" + data.robotName + "]: ";
	}
	else if ( data.washerId )
	{
		str = "Wash [" + data.washerName + "]: ";
	}
	else if ( data.bufferId )
	{
		str = "Buffer [" + data.bufferName + "]: ";
	}
	
	newModal.setAttribute("id",data.uuid);
	newModal.setAttribute("class","modal");
	newModal.setAttribute("role","dialog");
	modalDialog.setAttribute("class","modal-dialog modal-m");
	modalContent.setAttribute("class","modal-content");
	modalHeader.setAttribute("class","modal-header");
	modalHeader.setAttribute("style","text-align: center;");
	// modalHeading.innerHTML = data.eventType + ": " + data.error_code; // Byttes til at stå i body
	modalHeading.innerHTML = str + data.text;
	modalHeader.appendChild(modalHeading);
	modalBody.setAttribute("class","modal-body");
	// modalText.innerHTML = str + data.text; // Byttes til at stå i header
	modalText.innerHTML = data.eventType + ": " + data.error_code;
	modalBody.appendChild(modalText);
	modalComment.style.resize = "vertical";
	modalComment.rows = "3";
	modalComment.setAttribute("id","comment " + data.uuid);
	
	modalComment.classList.add("form-control");
	modalCommentLabel.setAttribute("class","label label-info");
	modalCommentLabel.innerHTML = "Comment:"
	modalBody.appendChild(modalCommentLabel);
	modalBody.appendChild(modalComment);
	modalFooter.setAttribute("class", "modal-footer");
	
	// btnHelp.setAttribute("class", "btn btn-default");
	// btnHelp.setAttribute("onclick", "Help('aad96e00-2ebb-11e9-b602-98e7f4f0e12b')");
	// btnHelp.innerHTML = "<span class='fas fa-question fa-lg' style='color:grey'></span>";
	
	// btnManFix.setAttribute("class", "btn btn-info");
	// btnManFix.setAttribute("style", "float:left");
	// btnManFix.setAttribute("onclick", "ManualFixEvent('" + data.uuid + "')");
	// btnManFix.innerHTML = "Fixed";
	
	// btnAbort.setAttribute("class", "btn btn-info");
	// btnAbort.setAttribute("style", "float:left");
	// btnAbort.setAttribute("onclick", "AbortEvent('" + data.uuid + "')");
	// btnAbort.innerHTML = "Abort";
	
	btnOK.setAttribute("class", "btn btn-info");
	btnOK.setAttribute("style", "float:left");
	btnOK.setAttribute("onclick", "RetryEvent('" + data.uuid + "',true)");
	btnOK.innerHTML = "Ok";

	// btnIgnore.setAttribute("class", "btn btn-default");
	// btnIgnore.setAttribute("style", "float:left");
	// btnIgnore.setAttribute("onclick", "IgnoreEvent('" + data.uuid + "')");//"$('#modal" + data.id + "').modal('hide');");
	// btnIgnore.innerHTML = "Ignore";
	
	// modalFooter.appendChild(btnManFix);
	modalFooter.appendChild(btnOK);
	// modalFooter.appendChild(btnAbort);
	// modalFooter.appendChild(btnIgnore);
	//modalFooter.appendChild(btnHelp);
	modalContent.appendChild(modalHeader);
	modalContent.appendChild(modalBody);
	modalContent.appendChild(modalFooter);
	modalDialog.appendChild(modalContent);
	newModal.appendChild(modalDialog);
	mainBody.appendChild(newModal);
	$("#" + data.uuid).modal({backdrop: "static"});
	return true;
}

/** Remove the modal from the user UI
 * @todo Possibly have a timeout that reminds the user. This must also be cleared when event is cleared
 * 
 * @param {string} uuid 
 */
function IgnoreEvent(uuid)
{
	document.body.classList.remove("modal-open");
	var modal = document.getElementById(uuid);
	if(!modal)
	{
		return;
	}
	if ( modal.nextSibling.classList.contains("modal-backdrop") )
	{
		modal.nextSibling.remove();
	}
	modal.remove();
}

/** Clear the modal popup and remove the alert from the session
 * 
 * @param {string} uuid 
 * @param {boolean} thisTerminal If true, this will send a message to the server that the user has cleared the alert
 */
function RetryEvent(uuid,thisTerminal=false)
{
	//var mainBody = document.body;
	document.body.classList.remove("modal-open");
	if( thisTerminal ) // If the server sends the clear signal, it should not message the server back
	{
		var comment = document.getElementById("comment " + uuid).value;
		simpleSocketRequest("clear event",{uuid:uuid,user:getUserFromStorage(),"comment":comment});
	}
	sessionStorage.removeItem(uuid); // Remove from seesion storage
	IgnoreEvent(uuid); // Remove from UI
}

function AbortEvent(uuid)
{
	RetryEvent(uuid);
}

function ManualFixEvent(uuid)
{
	RetryEvent(uuid);
}

function ClearEvent(uuid)
{
	IgnoreEvent(uuid);
	sessionStorage.removeItem(uuid);
}