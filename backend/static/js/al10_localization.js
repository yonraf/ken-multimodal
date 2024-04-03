function Help(tagId)
{
	var xhttp = new XMLHttpRequest();
	var params = {
		tagId	: tagId
	}
	var URIQuery = jQuery.param(params);
	xhttp.open("GET", "/languageText?" + URIQuery, true);
	xhttp.send();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var txt = JSON.parse(xhttp.responseText)[0];
			alert(txt.text)
		}
		else if(this.readyState == 4 && this.status == 402)
		{
			alert(xhttp.responseText);
			return;
		}
	}
	// LanguageText
}

function GetListOfTexts()
{	
	var tmpLang = document.querySelectorAll("[data-al10-lang]");
	var ii = 0;
	var data = [];
	str = "";
	for ( ii = 0; ii < tmpLang.length ; ii++ )
	{
		// str += ii + "," + tmpLang[ii].dataset.al10Lang + "," + tmpLang[ii].innerHTML + "\n";
		data.push( {"tag": tmpLang[ii].dataset.al10Lang, "val": tmpLang[ii].innerHTML } );
	}
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST","/listOfTexts",true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	
	xhttp.onreadystatechange = function()
	{
		if ( this.readyState == XMLHttpRequest.DONE && this.status == 200 )
		{
			alert("All done: " + this.statusText);
		} 
	}
	xhttp.send( JSON.stringify(data) );
	/*
	var params = {
		tagId	: tagId
	}
	var URIQuery = jQuery.param(params);
	xhttp.open("POST", "/listOfTexts?" + URIQuery, true);
	xhttp.send();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var txt = JSON.parse(xhttp.responseText)[0];
			alert(txt.text)
		}
		else if(this.readyState == 4 && this.status == 402)
		{
			alert(xhttp.responseText);
			return;
		}
	}
	*/
	return data;
}