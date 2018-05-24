<?php

if(empty($_POST['username']) or empty($_POST['password']))
	{
	echo '<!DOCTYPE html>' . "\n\n";

	echo '<html lang="en-US">' . "\n\n\n\t";


		echo '<head>' . "\n\t\t";
			echo '<meta charset="utf-8">' . "\n\t\t";
			echo '<meta http-equiv="Cache-Control" content="no-store">' . "\n\t\t";
			echo '<title>Host WDC</title>' . "\n\t\t";
			echo '<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">' . "\n\t\t";
			echo '<style>.wrapper{margin: 70px auto 0;height: 300px;width: 500px;}</style>' . "\n\t\t";
			echo '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js" type="text/javascript"></script>' . "\n\t\t";
			echo '<script src="https://connectors.tableau.com/libs/tableauwdc-2.3.latest.js" type="text/javascript"></script>' . "\n\t\t";
			echo '<script type="text/javascript"></script>' . "\n\t";
		echo '</head>' . "\n\t";
		echo '<body>' . "\n\t\t";
			echo '<div class="wrapper w3-card">' . "\n\t\t\t";
				echo '<h1 class="w3-container w3-cyan">Host Credentials</h1>' . "\n\t\t\t";
				echo '<form class="w3-container" action="' . $_SERVER['PHP_SELF'] . '" method="post">' . "\n\t\t\t\t";
					echo '<label>Username:</label>' . "\n\t\t\t\t";
					echo '<input class="w3-input" type="text" name="username"><br>' . "\n\t\t\t\t";
					echo '<label>Password:</label>' . "\n\t\t\t\t";
					echo '<input class="w3-input" type="password" name="password"><br>' . "\n\t\t\t\t";
					echo '<input class="w3-input" type="submit" value="Submit">' . "\n\t\t\t";
				echo '</form>' . "\n\t\t";
			echo '</div>' . "\n\t";
		echo '</body>' . "\n\n\n";


	echo '</html>';
	}
else
	{
	$soapXML = '<?xml version=\'1.0\' encoding=\'UTF-8\'?><ns1:Envelope xmlns:ns1="http://schemas.xmlsoap.org/soap/envelope/"><ns1:Body>' . 
		'<ns2:GLData_RetrieveWithLogin xmlns:ns2="http://www.HostAnalytics.com/API/SOAP/StateFree/Common/2009/03/19"><ns2:LoginName>' .
		$_POST['username'] . '</ns2:LoginName><ns2:Password>' . $_POST['password'] . 
		'</ns2:Password><ns2:TenantCode>SF208149</ns2:TenantCode><ns2:FilterCollection><ns2:GLDataFilter><ns2:Field>' .
		'Scenario</ns2:Field><ns2:FieldOperator>Equals</ns2:FieldOperator><ns2:Value><ns2:string>2018 Budget</ns2:string>' .
		'</ns2:Value></ns2:GLDataFilter><ns2:GLDataFilter><ns2:Field>AmountType</ns2:Field><ns2:FieldOperator>Equals' .
		'</ns2:FieldOperator><ns2:Value><ns2:string>MTD</ns2:string></ns2:Value></ns2:GLDataFilter><ns2:GLDataFilter>' .
		'<ns2:Field>FiscalYear</ns2:Field><ns2:FieldOperator>Equals</ns2:FieldOperator><ns2:Value><ns2:string>2018</ns2:string>' .
		'</ns2:Value></ns2:GLDataFilter><ns2:GLDataFilter><ns2:Field>FiscalPeriod</ns2:Field><ns2:FieldOperator>Equals' .
		'</ns2:FieldOperator><ns2:Value><ns2:string>1</ns2:string></ns2:Value></ns2:GLDataFilter></ns2:FilterCollection>' .
		'</ns2:GLData_RetrieveWithLogin></ns1:Body></ns1:Envelope>';
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://epm01.hostanalytics.com/HostAPI/HostAPI_StateFree.asmx');
    curl_setopt( $ch, CURLOPT_POST, true );
    curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml', 'SOAPAction: "http://www.HostAnalytics.com/API/SOAP/StateFree/Common/2009/03/19/GLData_RetrieveWithLogin"'));
    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
    curl_setopt( $ch, CURLOPT_POSTFIELDS, $soapXML );
    $XMLresult = curl_exec($ch);
    curl_close($ch);
	$XMLresult = str_replace(array("\n", "\r", "\t"), '', $XMLresult);
	$XMLresult = trim(str_replace('"', "'", $XMLresult));
	$xmlStart = strpos($XMLresult, "<GLData_RetrieveWithLoginResult>");
	$xmlLength = strpos($XMLresult, "</GLData_RetrieveWithLoginResponse>") - $xmlStart;
	$XMLresult = substr($XMLresult, $xmlStart, $xmlLength);
	$myXML = simplexml_load_string($XMLresult);
	$myJSON = json_encode($myXML);
	echo $myJSON;
	}
?>