<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="../css/reset.css">
    <link rel="stylesheet" href="../css/account.css">
    <link rel="stylesheet" href="../css/main.css">
</head>

<body>
    <h2 class="pageTitle">アカウント作成</h2>

    <form action="./register_process.php" method="POST" class="registerForm form">
        <label>
            ユーザーID
            <input type="text" name="userID" required
                placeholder="半角英数字（3〜20文字）">
        </label>

        <label>
            パスワード
            <input type="password" name="password" required
                placeholder="8文字以上">
        </label>

        <label>
            パスワード（確認）
            <input type="password" name="password_confirm" required>
        </label>

        <button type="submit" class="button primary">
            アカウントを作成する
        </button>

        <p class="formNote">
            すでにアカウントをお持ちですか？
            <a href="../index.php">ログインはこちら</a>
        </p>
    </form>
    <?php if (isset($_GET['error'])): ?>
        <p class="errorMessage">
            <?php
            switch ($_GET['error']) {
                case 'empty':
                    echo '未入力の項目があります';
                    break;
                case 'duplicate':
                    echo 'そのユーザーIDはすでに使われています';
                    break;
                case 'password_mismatch':
                    echo 'パスワードが一致しません';
                    break;
                default:
                    echo '入力内容にエラーがあります';
            }
            ?>
        </p>
    <?php endif; ?>

</body>

</html>