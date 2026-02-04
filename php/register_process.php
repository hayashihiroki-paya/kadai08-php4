<?php
include('functions.php');
session_start();

// =============================
// 1. POSTチェック
// =============================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

// =============================
// 2. 入力値取得 & トリム
// =============================
$userID = trim($_POST['userID'] ?? '');
$password = $_POST['password'] ?? '';
$passwordConfirm = $_POST['password_confirm'] ?? '';

// =============================
// 3. バリデーション
// =============================

// 未入力チェック
if ($userID === '' || $password === '' || $passwordConfirm === '') {
    header('Location: ./register.php?error=empty');
    exit;
}

// 文字数・形式チェック
if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $userID)) {
    header('Location: ./register.php?error=userID');
    exit;
}

// パスワード長
if (strlen($password) < 8) {
    header('Location: ./register.php?error=password_length');
    exit;
}

// パスワード一致
if ($password !== $passwordConfirm) {
    header('Location: ./register.php?error=password_mismatch');
    exit;
}

// =============================
// 4. ユーザーID重複チェック
// =============================
$pdo = connect_db();
$sql = 'SELECT id FROM users_table WHERE userID = :userID';
$stmt = $pdo->prepare($sql);
$stmt->execute([':userID' => $userID]);

if ($stmt->fetch()) {
    header('Location: ./register.php?error=duplicate');
    exit;
}

// =============================
// 5. パスワードハッシュ化
// =============================
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// echo "登録直前";
// exit();

// =============================
// 6. DB登録
// =============================
$sql = 'INSERT INTO users_table (id, userID, password, created_at, updated_at)
    VALUES (NULL, :userID, :password, now(),now())';

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':userID'  => $userID,
    ':password' => $hashedPassword,
]);

// =============================
// 7. 自動ログイン処理
// =============================
$sql = 'SELECT * FROM users_table WHERE userID=:userID AND password=:password';
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':userID', $userID, PDO::PARAM_STR);
$stmt->bindValue(':password', $hashedPassword, PDO::PARAM_STR);

try {
    $status = $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
}

// SQL実行の処理
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// var_dump($user);
// exit();

if (!$user) {
    exit("ユーザー情報がありません");
} else {
    $_SESSION = array();
    $_SESSION['session_id'] = session_id();
    $_SESSION["userID"] = $user["userID"];
}

// =============================
// 8. トップへリダイレクト
// =============================
header('Location: ../index.php');
exit;
