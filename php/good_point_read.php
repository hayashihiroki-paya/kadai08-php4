<?php
include('functions.php');
require './auth_check.php';
checkSessionId();
// echo "お気に入りデータ取得ページに移動できました";
// POSTデータチェック
if (!isset($_POST["book_id"]) || $_POST["book_id"] === "") {
    exit();
}

// $userID = $_SESSION["userID"];
// jQueryを使って？POSTで受け取ったデータは必ずstringになるので数値はintに変換する
$book_id = filter_input(INPUT_POST, 'book_id', FILTER_VALIDATE_INT);
// 数値になってるはず
if ($book_id === false) {
    // 不正な値
    exit;
}
// SQL接続
$pdo = connect_db();
$sql = 'SELECT * FROM good_point_table';
$stmt = $pdo->prepare($sql);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}

// SQL実行の処理
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
$goodPoints = [];
foreach ($result as $record) {
    if ($record["user_id"] === $user_id && $record["book_id"] === $book_id) {
        // userID が一致しているので配列に保存
        $goodPoints[] = [
            "category" => $record["category"],
            "goodPoint" => $record["goodPoint"]
        ];
    }
}

echo json_encode($goodPoints, JSON_UNESCAPED_UNICODE);