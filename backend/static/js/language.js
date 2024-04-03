var socketLang = io();

/**Author: MKL
 * Initiating information
 */
requestLanguageInformation()
requestStandardLanguage()

/* Sending data from external javascript files */
function simpleLangaugeRequest(req,data=null){
	socketLang.emit(req,data);
}

/**Author: MKL
 * This request the different languages that can be used on this server
 */
function requestLanguageInformation()
{
	console.log("CALL: request Language Choices");
    simpleLangaugeRequest( "request Language Choices")
}

/**Author: MKL
 * This response on the socket call and calls the approiate function
 */
socketLang.on("response Language Choices", (data) => {
    console.log("CALL: response LanugageChoices");
	setClientLangSelector(data)
	SetStandardLangSelector(data)
});

function requestStandardLanguage()
{
	console.log("CALL: request Standard Language");
	
	simpleLangaugeRequest("request Standard Language")
}

socketLang.on("response Standard Language",(data)=>
{
	
	localStorage.setItem("standardLanguage", data)
	console.log("CALL: response Standard Language: " + localStorage.getItem("standardLanguage"));
	PopulateLanguage()
})

function PopulateLanguage()
{
	console.log("PopulateLanguage()");
	var standardLand = localStorage.getItem("standardLanguage")
	if(standardLand == null ||standardLand == undefined)
	{	// the flag have not been set. wait and try again
		requestStandardLanguage()
		setTimeout(()=>{
			PopulateLanguage ()
		},200)
	}
	else
	{
		
		var flagImg = document.createElement("img");
		flagImg.setAttribute("src", "flag_" + standardLand + ".png")
		flagImg.style.marginLeft = "20px"
		flagImg.style.height = "80px"
		flagImg.setAttribute("id", standardLand)
		var flagholder =  document.getElementById("currentLanguageText")
		if(flagholder)
		{
			flagholder.innerHTML = ""
			flagholder.appendChild(flagImg)
		}
	}	
}

/**Author: MKL
 * This saves the client langCode 
 * @param {*} langCode 
 */
function setClientLang(langCode)
{
    console.log("setClientLang(" + langCode + ")");
	localStorage.setItem("langCode", langCode)
	$("#loginModal").modal("hide");
    var reloadWindow = location.href

	return window.open(reloadWindow, "_top");
}


function selectedStandardLang(langCode)
{
	localStorage.setItem("standardLanguage", langCode)
	g_ListOfFlags.forEach(element=>{
		document.getElementById("flag_" + element).style.borderRadius = ""
	})
	document.getElementById("flag_" + langCode).style.borderRadius = "50%"
}


/**Author: MKL
 * the return function for the requestLanguageInformation()
 * @param {*} langList a list of lang codes in the database
 */
function setClientLangSelector(langList) 
{
	console.log("setClientLangSelector()");
	var flagholder = document.getElementById("flagsSelectLang")
	if(flagholder!= null)
	{
		flagholder.innerHTML = ""
		flagholder.classList.add('class="text-center"')
		langList.forEach(element => {
	
			var flagImg = document.createElement("img");
			flagImg.setAttribute("src", "flag_" + element + ".png")
			flagImg.style.marginLeft = "20px"
			flagImg.style.height = "80px"
			flagImg.setAttribute("id", element)
			flagImg.setAttribute("onclick", "setClientLang(\"" + element + "\")")
			flagholder.appendChild(flagImg)
		});
	}
}


var g_ListOfFlags = {}
/**Author: MKL
 * This Generates a list of language to choose from
 * @param {*} langList 
 */
function SetStandardLangSelector(langList)
{
	g_ListOfFlags = langList
	var flagholder = document.getElementById("flagsSelectLangGeneral")
	if(flagholder != null)
	{	flagholder.innerHTML = ""
		flagholder.classList.add('class="text-center"')
		langList.forEach(element => {
	
			var flagImg = document.createElement("img");
			flagImg.setAttribute("src", "flag_" + element + ".png")
			flagImg.style.marginLeft = "20px"
			flagImg.style.height = "80px"
			flagImg.style.borderRadius = ""
			flagImg.setAttribute("id", "flag_" + element)
			flagImg.setAttribute("onclick", "selectedStandardLang(\"" + element + "\")")
			flagImg.classList.add("LangImg")
			flagholder.appendChild(flagImg)
		});
	}
}
