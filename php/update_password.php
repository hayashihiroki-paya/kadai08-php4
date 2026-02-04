<?php
include('functions.php');
require './auth_check.php';
checkSessionId();

// =============================
// 1. 入力取得
// =============================
$currentPassword = $_POST['current_password'] ?? '';
$newPassword     = $_POST['new_password'] ?? '';
$newPasswordConf = $_POST['new_password_confirm'] ?? '';

// =============================
// 2. 未入力チェック
// =============================
if ($currentPassword === '' || $newPassword === '' || $newPasswordConf === '') {
    header('Location: ./account_settings.php?error=empty');
    exit;
}

// =============================
// 3. 新パスワード条件
// =============================
if (strlen($newPassword) < 8) {
    header('Location: ./account_settings.php?error=length');
    exit;
}

if ($newPassword !== $newPasswordConf) {
    header('Location: ./account_settings.php?error=mismatch');
    exit;
}

// =============================
// 4. 現在のパスワード検証
// =============================
$pdo = connect_db();
$sql = 'SELECT password FROM users_table WHERE user_id = :user_id';
$stmt = $pdo->prepare($sql);
$stmt->execute([':user_id' => $user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($currentPassword, $user['password'])) {
    header('Location: ./account_settings.php?error=current');
    exit;
}

// =============================
// 5. パスワード更新
// =============================
$newHash = password_hash($newPassword, PASSWORD_DEFAULT);

$sql = 'UPDATE users_table SET password = :password WHERE user_id = :user_id';
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':password' => $newHash,
    ':user_id'   => $user_id,
]);

// =============================
// 6. 完了
// =============================
header('Location: ./account_settings.php?status=success');
exit;
