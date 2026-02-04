<?php
include('functions.php');
require './auth_check.php';
checkSessionId();

// $_POST["bookData"]ない時終了
if (!isset($_POST["bookData"])) {
  exit();
}

// 受け取ったデータ格納
$bookData = $_POST["bookData"];
// echo $bookData["itemCaption"];
$bookData["itemCaption"] = sanitizeForCsv($bookData["itemCaption"]);
// echo $bookData["itemCaption"];
// $userID = $_SESSION["userID"];

// SQL接続
$pdo = connect_db();
// booksにデータがなければ新規追加、あったらupdated_at更新
$sql = 'INSERT INTO books (
  id,
  isbn,
  title,
  titleKana,
  author,
  authorKana,
  publisherName,
  salesDate,
  seriesName,
  itemCaption,
  largeImageUrl,
  created_at,
  updated_at
) VALUES (
  NULL,
  :isbn,
  :title,
  :titleKana,
  :author,
  :authorKana,
  :publisherName,
  :salesDate,
  :seriesName,
  :itemCaption,
  :largeImageUrl,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE updated_at = NOW()';

$stmt = $pdo->prepare($sql);

$stmt->bindValue(':isbn', $bookData["isbn"], PDO::PARAM_STR);
$stmt->bindValue(':title', $bookData["title"], PDO::PARAM_STR);
$stmt->bindValue(':titleKana', $bookData["titleKana"], PDO::PARAM_STR);
$stmt->bindValue(':author', $bookData["author"], PDO::PARAM_STR);
$stmt->bindValue(':authorKana', $bookData["authorKana"], PDO::PARAM_STR);
$stmt->bindValue(':publisherName', $bookData["publisherName"], PDO::PARAM_STR);
$stmt->bindValue(':salesDate', $bookData["salesDate"], PDO::PARAM_STR);
$stmt->bindValue(':seriesName', $bookData["seriesName"], PDO::PARAM_STR);
$stmt->bindValue(':itemCaption', $bookData["itemCaption"], PDO::PARAM_STR);
$stmt->bindValue(':largeImageUrl', $bookData["largeImageUrl"], PDO::PARAM_STR);

try {
  $status = $stmt->execute();
} catch (PDOException $e) {
  echo json_encode(["sql error" => "{$e->getMessage()}"]);
  exit();
}
// 保存処理ココまで

// book_id(=booksのid)取得
$sql = 'SELECT id FROM books WHERE isbn = :isbn';
$stmt = $pdo->prepare($sql);

$stmt->bindValue(':isbn', $bookData["isbn"], PDO::PARAM_STR);

try {
  $status = $stmt->execute();
} catch (PDOException $e) {
  echo json_encode(["sql error" => "{$e->getMessage()}"]);
  exit();
}

$id = $stmt->fetch(PDO::FETCH_ASSOC);
$book_id = $id['id'];

// var_dump($book_id);
// exit();

// 重複チェック
// SQL接続
$pdo = connect_db();
$sql = 'SELECT * FROM favorites_table';
$stmt = $pdo->prepare($sql);

try {
  $status = $stmt->execute();
} catch (PDOException $e) {
  echo json_encode(["sql error" => "{$e->getMessage()}"]);
  exit();
}

// SQL実行の処理
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($result as $record) {
  if ($record["user_id"] === $user_id && $record["book_id"] === $book_id) {
    // user_id と book_id が重複しているので保存処理をカット
    echo "重複を検知したので保存せずに戻します";
    // indexに戻す
    // header("Location: ../index.php");
    exit();
  }
}


// SQL作成&実行
$sql = 'INSERT INTO favorites_table (id, comment, created_at, updated_at, user_id, book_id) VALUES (NULL, :comment, now(), now(), :user_id, :book_id)';

$stmt = $pdo->prepare($sql);

// バインド変数を設定 RDB化につき、データ量削減
// $stmt->bindValue(':userID', $userID, PDO::PARAM_STR);
// $stmt->bindValue(':author', $bookData["author"], PDO::PARAM_STR);
// $stmt->bindValue(':authorKana', $bookData["authorKana"], PDO::PARAM_STR);
// $stmt->bindValue(':isbn', $bookData["isbn"], PDO::PARAM_STR);
// $stmt->bindValue(':itemCaption', $bookData["itemCaption"], PDO::PARAM_STR);
// $stmt->bindValue(':largeImageUrl', $bookData["largeImageUrl"], PDO::PARAM_STR);
// $stmt->bindValue(':publisherName', $bookData["publisherName"], PDO::PARAM_STR);
// $stmt->bindValue(':salesDate', $bookData["salesDate"], PDO::PARAM_STR);
// $stmt->bindValue(':seriesName', $bookData["seriesName"], PDO::PARAM_STR);
// $stmt->bindValue(':title', $bookData["title"], PDO::PARAM_STR);
// $stmt->bindValue(':titleKana', $bookData["titleKana"], PDO::PARAM_STR);
$stmt->bindValue(':comment', $bookData["comment"], PDO::PARAM_STR);
$stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
$stmt->bindValue(':book_id', $book_id, PDO::PARAM_STR);

// SQL実行（実行に失敗すると `sql error ...` が出力される）
try {
  $status = $stmt->execute();
} catch (PDOException $e) {
  echo json_encode(["sql error" => "{$e->getMessage()}"]);
  exit();
}