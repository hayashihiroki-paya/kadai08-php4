<?php
include('functions.php');
session_start();

// 受け取れてる
// var_dump($_POST);
// exit();

if (
    !isset($_POST["userID"]) || $_POST["userID"] === "" ||
    !isset($_POST["password"]) || $_POST["password"] == ""
) {
    exit("POSTデータありません");
}

$userID = $_POST["userID"];
$inputPassword = $_POST['password'];

// SQL接続
$pdo = connect_db();
$sql = 'SELECT * FROM users_table WHERE userID=:userID';
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':userID', $userID, PDO::PARAM_STR);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}

// SQL実行の処理
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    exit("ユーザー情報がありません");
} else {
    $dbHash = $user['password'];
    if (password_verify($inputPassword, $dbHash)) {
        $_SESSION = array();
        $_SESSION['session_id'] = session_id();
        $_SESSION["userID"] = $user["userID"];
        $_SESSION["user_id"] = $user["id"];
    }
}

header("Location: ../index.php");
exit();