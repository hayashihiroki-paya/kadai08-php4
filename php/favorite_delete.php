<?php
include('functions.php');
require './auth_check.php';
checkSessionId();
if (!isset($_POST["book_id"]) || $_POST["book_id"] === "") {
    // echo "POSTデータなし";
    exit();
}
// $userID = $_SESSION["userID"]; require './auth_check.php'で取得
$book_id = $_POST["book_id"];

$pdo = connect_db();
// SQL接続
// book_idとユーザーIDが一致しているものを削除 -> users_tableのidで調べる
$sql = 'DELETE FROM favorites_table WHERE book_id = :book_id AND user_id = :user_id';
$stmt = $pdo->prepare($sql);

// バインド変数
$stmt->bindValue(':book_id', $book_id, PDO::PARAM_STR);
$stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}