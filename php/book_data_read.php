<?php
include('functions.php');
// require './auth_check.php';
// checkSessionId();

// POST情報ない時終了
if (!isset($_POST["book_id"]) || $_POST["book_id"] === "") {
    exit();
}

$book_id = $_POST["book_id"];

// book_id を渡して１冊のデータを取得
$goodPoints = getBookPoints($book_id);

// データをソートして件数も追加したものに変換します
$sortData = dataSort($goodPoints);

echo json_encode($sortData, JSON_UNESCAPED_UNICODE);
