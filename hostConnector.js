// Function that changes XML to JSON
function xmlToJson( xml )
	{
	// Create the return object
	var jsonObject = {}
	
	//
	if( xml.nodeType == 1 ) // Element Node
		{
		// If there are attributes, convert attributes to JSON
		if( xml.attributes.length > 0 )
			{
			jsonObject["@attributes"] = {};
			
			for( var i = 0; i < xml.attributes.length; i++ )
				{
				var attribute = xml.attributes.item( i );
				
				jsonObject["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		// Convert the text nodes to JSON
		else if( xml.nodeType == 3 ) // Text Node
			{
			jsonObject = xml.nodeValue;
			}
		}
		
	// Convert children and their text nodes to JSON
	if( xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3 )
		{
		jsonObject = xml.childNodes[0].nodeValue;
		}
	else if( xml.hasChildNodes() )
		{
		for( var i = 0; i < xml.childNodes.length; i++ )
			{
			var item = xml.childNodes.item( i );
			var nodeName = item.nodeName;
			
			if( typeof( jsonObject[nodeName] ) == "undefined" )
				{
				jsonObject[nodeName] = xmlToJson( item );
				}
			else
				{
				if( typeof( jsonObject[nodeName].push ) == "undefined" )
					{
					var old = jsonObject[nodeName];
					jsonObject[nodeName] = [];
					jsonObject[nodeName].push( old );
					}
				
				jsonObject[nodeName].push( xmlToJson( item ) );
				}
			}
		}
		
	return jsonObject;
	}                  //end xmltojson function

// Create an IIFE to run the connector
(function()                                                    //  A1  I have verified this syntax. It goes with the very bottom line, so far, to tell the parser to expect an expression
	{
	var myConnector = tableau.makeConnector();
	
	myConnector.getSchema = function( schemaCallback )
		{
		var cols = [{
			id: "account",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "company",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "ICDefault",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "businessUnit",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "department",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "salesOrigin",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "invSrc",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "projectFuture",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "scenario",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "reporting",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "amount",
			dataType: tableau.dataTypeEnum.float
			}, {
			id: "amtType",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "fiscalYear",
			dataType: tableau.dataTypeEnum.string
			}, {
			id: "fiscalMonth",
			dataType: tableau.dataTypeEnum.string
			}];
			
		var tableSchema = {
			id: "hostData",
			alias: "Host budget data",
			columns: cols
			};
			
		schemaCallback( [tableSchema] );
		}     //end schemacallback function

// Create a function that strips out the unnecessary parent nodes from the Host XML
function stripParentNodes( hostXML )
	{
	var finishedXML = hostXML;
	
	while( finishedXML.getElementsByTagName("*")[0].nodeName != "GLData" )
		{
		var temp = finishedXML.childNodes;
		finishedXML = temp;
		}
	}
		
	myConnector.getData = function( table, doneCallback )
		{
			        function soap() {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', 'https://epm01.hostanalytics.com/HostAPI/HostAPI_StateFree.asmx', true);      

var authObj = JSON.parse(tableau.connectionData);			
			
		var xmlFromAPI = // Store XML returned from the Host API, needs to be in XML object form
		
		'<?xml version="1.0" encoding="UTF-8"?>' +
'<ns1:Envelope xmlns:ns1="http://schemas.xmlsoap.org/soap/envelope/">'+
  '<ns1:Body>' +
    '<ns2:GLData_RetrieveWithLogin xmlns:ns2="http://www.HostAnalytics.com/API/SOAP/StateFree/Common/2009/03/19">'+
      '<ns2:LoginName>' + authObj.user + '/ns2:LoginName>' +
      '<ns2:Password>' + authObj.upw + '</ns2:Password>' +
      '<ns2:TenantCode>' + authObj.tenCode + '</ns2:TenantCode>'+      
      '<ns2:FilterCollection>' +        
        '<ns2:GLDataFilter>' +
          '<ns2:Field>Scenario</ns2:Field>' +
          '<ns2:FieldOperator>Equals</ns2:FieldOperator>' +
          '<ns2:Value>' +
            '<ns2:string>2018 Budget</ns2:string>' +
          '</ns2:Value>' +
        '</ns2:GLDataFilter>' +
		      '</ns2:FilterCollection>' +
    '</ns2:GLData_RetrieveWithLogin>' +
  '</ns1:Body>' +
'</ns1:Envelope>';
			
			            // Send the POST request
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.send(xmlFromAPI);
			};

		$.getJSON( xmlToJson( stripParentNodes( xmlFromAPI ) ), function( resp )
			{
			var feat = resp.features, tableData = [];
			
			// Iterate through the JSON object
			for( var i = 0; i < feat.length; i++ )
				{
				tableData.push({
					"account": feat[i].Segment1,
					"company": feat[i].Segment2,
					"ICDefault": feat[i].Segment3,
					"businessUnit": feat[i].Segment4,
					"department": feat[i].Segment5,
					"salesOrigin": feat[i].Segment6,
					"invSrc": feat[i].Segment7,
					"projectFuture": feat[i].Segment8,
					"scenario": feat[i].Scenario,
					"reporting": feat[i].Reporting,
					"amount": feat[i].Amount,
					"amtType": feat[i].AmountType,
					"fiscalYear": feat[i].FiscalYear,
					"fiscalMonth": feat[i].FiscalPeriod
					});
				}
			
			table.appendRows( tableData );
			doneCallback();
			});
		}
		
	tableau.registerConnector( myConnector );
	
	$( document ).ready( function()
		{
		$( "#submitButton" ).click( function()
			{
				var authStrObj = {
                user: $('#user_name').val().trim(),
                upw: $('#password').val().trim(),
				tenCode: $('#tenant_code').val().trim()
            };
			tableau.connectionData = JSON.stringify(authStrObj);
			tableau.connectionName = "Host Data";      // This will be the data source name in Tableau
			setTimeout(function(){tableau.submit()}, 3000);
	//		tableau.submit();                               // This sends the connector object to Tableau
			});
		});
	})();                                                              //This is the very bottom line right now, to match my earlier comment A1