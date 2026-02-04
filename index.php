<?php
session_start();

// ログインされていた時の処理
if (isset($_SESSION["userID"])) {
    // echo $_SESSION["userName"];
    // ユーザー名を取得する（表示用）
    // 表示もいったんIDのみで
    // $userName = $_SESSION["userName"];
    // ユーザーIDを取得する（お気に入りデータ操作用）
    $userID = $_SESSION["userID"];
    $favoriteText = "検索結果から登録したいものをドラッグ＆ドロップしてください";
} else {
    $userID = "ログインされてません";
    $favoriteText = "お気に入り登録をするにはログインしてください";
}

?>

<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ラノベならべ</title>
    <!--jQueryを読み込み-->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <!--jQuery UIを読み込み-->
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <link rel="stylesheet"
        href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/ui-darkness/jquery-ui.css">
    <!-- axiosライブラリの読み込み -->
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/main.css">
</head>

<body>
    <header class="appHeader">
        <div class="headerLeft">
            <h1 class="title">📚ラノベならべ📚</h1>
        </div>

        <div class="headerRight">

            <details class="userMenu">
                <summary class="userName">
                    <?= htmlspecialchars($userID, ENT_QUOTES, 'UTF-8'); ?>
                </summary>

                <div class="userMenuBody">
                    <a href="./php/account_settings.php">アカウント設定</a>
                    <a href="./php/logout.php" class="logout">ログアウト</a>
                </div>
            </details>

            <details class="loginMenu">
                <summary class="userName">ログイン</summary>
                <div class="userMenuBody">
                    <form action="./php/login.php" method="POST" class="loginForm">
                        <input type="text" name="userID" placeholder="ユーザーID">
                        <input type="password" name="password" placeholder="パスワード">
                        <button type="submit" class="button">ログイン</button>
                        <div class="loginLinks">
                            <a href="./php/register.php" class="registerLink">
                                ▶ アカウントを作成する
                            </a>
                        </div>
                    </form>
                </div>
            </details>
        </div>
    </header>

    <main id="interface">
        <div id="search">
            <input id="searchWord" type="text" class="textInput">
            <button id="searchButton" class="button">検索</button>
            <div id="numberOfMatches"></div>
        </div>
        <div>
            <button class="userDataButton button">ユーザー情報を表示する</button>
        </div>
    </main>

    <div id="main">
        <div id="leftView">
            <div id="userInformation">

            </div>
            <div id="detailedInformation">

            </div>
            <div id="view">

                <div id="result">

                </div>
            </div>
        </div>

        <button id="favoriteToggle" class="button">
            ★ お気に入りを表示
        </button>
        <div id="favorite">
            <p>お気に入り登録リスト</p>
            <p><?= $favoriteText ?></p>
            <div id="favoriteList"></div>
        </div>
    </div>

    <script type="module" src="./js/main.js"></script>
</body>

</html>