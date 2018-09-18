<?php
$myfile = file_get_contents("./weather.json");
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
echo json_encode(json_decode($myfile));
?>