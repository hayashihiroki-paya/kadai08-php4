<?php
include('functions.php');
require './auth_check.php';
checkSessionId();
// echo "お気に入りデータ取得ページに移動できました";
// POSTデータチェック
if (
    !isset($_POST["book_id"]) || $_POST["book_id"] === "" ||
    !isset($_POST["comment"])
) {
    // echo "POSTデータなし";
    exit();
}
// $userID = $_SESSION["userID"];
$book_id = $_POST["book_id"];
$comment = $_POST["comment"];

$pdo = connect_db();
// SQL接続
// book_idとユーザーIDが一致しているものを削除
$sql = 'UPDATE favorites_table SET comment = :comment, updated_at = now() WHERE book_id = :book_id AND user_id = :user_id';
$stmt = $pdo->prepare($sql);

// バインド変数
$stmt->bindValue(':book_id', $book_id, PDO::PARAM_STR);
$stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
$stmt->bindValue(':comment', $comment, PDO::PARAM_STR);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}
