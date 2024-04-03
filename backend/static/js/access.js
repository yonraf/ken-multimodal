
var socketAccess = io();
// var g_settings = {};


/* Sending data from external javascript files */
function simpleAccessRequest(req,data=null){
	socketAccess.emit(req,data);
}

/**Author: MKL
 * Initiate information
 */
var yearcode = localStorage.getItem('password');
console.log("CALL: request userLoggedIn");
simpleAccessRequest( "request userLoggedIn", yearcode )

/**Author: MKL
 *  This relocates the user if nesssac
 * @param {Code} yearcode The response from the server
 */
function access(yearcode) {

	if(yearcode || location.href == (window.location.protocol + "//" + window.location.host + "/login"))
	{	// the user is logged in and allowed to see the page
		
	}
	else if(location.href == (window.location.protocol + "//" + window.location.host + "/"))
	{

	}
	else
	{	// the user is not loggin. redirect to login page
		var loginPage =  window.location.protocol + "//" + window.location.host + "/login"	        
		return window.open(loginPage, "_top");
	}
	
}

/**Author: MKL
 * This request access to the page
 */
function requestAccess() 
{
    var yearcode = document.getElementById("loginPassword").value
	simpleAccessRequest( "request yearcode authentication", yearcode )
	console.log("sending Password for confirmation");
	localStorage.setItem('password', yearcode);
	yearcode.value = ""
}


/**Author: MKL
 * This handles the reponse from the server. after the requestAccess() have been made
 * @param {*} yearcode  The response from the server
 */
function responseAuthentication(yearcode=false)
{
	if(yearcode)
	{	// correct password
		var technicUrl =  window.location.protocol + "//" + window.location.host + "/generalSettings"	
        document.getElementById("loginPassword").value = ""
        	
        return window.open(technicUrl, "_top");
	}
	else
	{	// wrong password
		document.getElementById("errorMessage").style.display = "block"
	}
}

/**Author: MKL
 * This logsout the user
 */
function logout() 
{
	console.log("logout() ");
	
	localStorage.setItem('password', false);
	simpleAccessRequest("request logout")
	return window.close()
	
}


/**Author: MKL
 * this catch the socket call from the server and calls the right funciton
 */
socketAccess.on("response userLoggedIn", (data) => {
	console.log("CALL: response userLoggedIn");
	
	access(data)
});

/**Author: MKL
 * This response on the socket call and calls the approiate function
 */
socketAccess.on("response yearcode authentication", (data) => {
	console.log("CALL: response yearcode authentication");
	
	responseAuthentication(data)
});

