<?php
include('functions.php');
require './auth_check.php';
checkSessionId();
// echo "ユーザーデータ取得処理開始";
// ログイン情報ない時終了
// if (!isset($_SESSION["userID"]) || $_SESSION["userID"] === "") {
//     exit("ログインしていません");
// }

// $userID = $_SESSION["userID"];

$sortData = getUserSortedPoints($user_id);

echo json_encode($sortData, JSON_UNESCAPED_UNICODE);
