<?php
$referer=$_POST['HTTP_REFERER'];
//if(stripos($referer,'chungkwong.cc')!==FALSE){
	$time=$_SERVER['REQUEST_TIME'];
	$ip=$_SERVER['REMOTE_ADDR'];
	$ua=$_SERVER['HTTP_USER_AGENT'];
	$opinion=$_POST['opinion'];
	$choice=$_POST['user-choice'];
	$result=$_POST['result'];
	$mysqli = mysqli_connect("domain", "user", "password", "database");
        mysqli_set_charset($mysqli,'utf8mb4');
	$sql = "INSERT INTO equations (time, ip, ua, opinion, choice, result) VALUES (?, ?, ?, ?, ?, ?)";
	$stmt = mysqli_prepare($mysqli,$sql);
	mysqli_stmt_bind_param($stmt,'isssss',$time, $ip, $ua, $opinion, $choice, $result);
	mysqli_stmt_execute($stmt);
//}
header('https://chungkwong.cc/equation-editor/test_finished.html');
exit;
?>
