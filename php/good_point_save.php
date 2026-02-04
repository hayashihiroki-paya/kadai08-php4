<?php
include('functions.php');
require './auth_check.php';
checkSessionId();
// echo "お気に入りデータ取得ページに移動できました";
// ログイン情報ない時終了
// if (!isset($_SESSION["userID"])) {
//     exit();
// }

// $userID = $_SESSION["userID"];

// POSTデータ受け取れるかチェック
if (
    !isset($_POST["book_id"]) ||
    !isset($_POST["category"]) ||
    !isset($_POST["goodPoint"])
) {
    exit();
}


$book_id = $_POST["book_id"];
$category = $_POST["category"];
$goodPoint = $_POST["goodPoint"];
// var_dump($goodPoint); //=> 二次元配列 OK

$pdo = connect_db();

// SQL作成&実行
// ON DUPLICATE KEY UPDATE updated_at = now() で、保存ボタン連打の保険的ブロック
$sql = 'INSERT INTO good_point_table (id, category, goodPoint, created_at, updated_at, user_id, book_id) 
    VALUES (NULL, :category, :goodPoint, now(), now(), :user_id, :book_id)
    ON DUPLICATE KEY UPDATE updated_at = now()';

$stmt = $pdo->prepare($sql);

// バインド変数を設定
$stmt->bindValue(':category', $category, PDO::PARAM_STR);
$stmt->bindValue(':goodPoint', $goodPoint, PDO::PARAM_STR);
$stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
$stmt->bindValue(':book_id', $book_id, PDO::PARAM_STR);

// SQL実行（実行に失敗すると `sql error ...` が出力される）
try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}
