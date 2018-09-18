<?php
$myfile = file_get_contents("./weather.json");
header('Content-type: application/json');
echo $myfile;
?>