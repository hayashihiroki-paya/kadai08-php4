<?php
include('functions.php');
require './auth_check.php';
checkSessionId();
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="../css/reset.css">
    <link rel="stylesheet" href="../css/account.css">
</head>

<body>

    <h2 class="pageTitle">ユーザー設定</h2>

    <h3>パスワード変更</h3>

    <?php if (isset($_GET['status']) && $_GET['status'] === 'success'): ?>
        <p class="successMessage">パスワードを変更しました</p>
    <?php endif; ?>

    <?php if (isset($_GET['error'])): ?>
        <p class="errorMessage">
            <?php
            switch ($_GET['error']) {
                case 'empty':
                    echo '未入力の項目があります';
                    break;
                case 'current':
                    echo '現在のパスワードが正しくありません';
                    break;
                case 'length':
                    echo '新しいパスワードは8文字以上にしてください';
                    break;
                case 'mismatch':
                    echo '新しいパスワードが一致しません';
                    break;
                default:
                    echo 'エラーが発生しました';
            }
            ?>
        </p>
    <?php endif; ?>

    <form action="./update_password.php" method="POST" class="updateForm form">
        <label>
            現在のパスワード
            <input type="password" name="current_password" required>
        </label>

        <label>
            新しいパスワード
            <input type="password" name="new_password" required>
        </label>

        <label>
            新しいパスワード（確認）
            <input type="password" name="new_password_confirm" required>
        </label>

        <button type="submit" class="button">変更する</button>
    </form>

    <a href="../index.php">トップに戻る</a>

</body>

</html>