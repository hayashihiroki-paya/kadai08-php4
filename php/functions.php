<?php


define('ENV', 'production'); // local / production
if (ENV === 'production') {
    $config = require __DIR__ . '/config.prod.php';
} else {
    $config = require __DIR__ . '/config.local.php';
}
function connect_db()
{
    global $config;
    // 各種項目設定
    $dbn = "mysql:dbname={$config['db_name']};charset=utf8mb4;host={$config['db_host']}";
    // $dbn = 'mysql:dbname=ranobenarabe_ranobe_db;charset=utf8mb4;port=3306;host=localhost';
    $user = $config['db_user'];
    $pwd = $config['db_pass'];

    // DB接続
    try {
        return new PDO($dbn, $user, $pwd);
    } catch (PDOException $e) {
        echo json_encode(["db error" => "{$e->getMessage()}"]);
        exit();
    }
}

function checkSessionId()
{
    if (!isset($_SESSION["session_id"]) || $_SESSION["session_id"] !== session_id()) {
        exit("session_id_error");
    } else {
        session_regenerate_id(true);
        $_SESSION["session_id"] = session_id();
    }
}

// ユーザーIDからお気に入り登録済みデータを取得する関数
function getUserFavoriteData($user_id)
{
    $pdo = connect_db();
    // SQL接続
    // $sql = 'SELECT * FROM favorites_table WHERE user_id = :user_id';
    $sql = 'SELECT * FROM favorites_table f JOIN books b ON f.book_id = b.id WHERE f.user_id = :user_id';
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
    $stmt->execute();

    try {
        $status = $stmt->execute();
    } catch (PDOException $e) {
        echo json_encode(["sql error" => "{$e->getMessage()}"]);
        exit();
    }

    // SQL実行の処理
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $favorites = [];
    foreach ($result as $record) {
        $favorites[] = [
            "author" => $record["author"],
            "authorKana" => $record["authorKana"],
            "isbn" => $record["isbn"],
            "itemCaption" => $record["itemCaption"],
            "largeImageUrl" => $record["largeImageUrl"],
            "publisherName" => $record["publisherName"],
            "salesDate" => $record["salesDate"],
            "seriesName" => $record["seriesName"],
            "title" => $record["title"],
            "titleKana" => $record["titleKana"],
            "comment" => $record["comment"],
            "book_id" => $record["book_id"]
        ];
    }

    return $favorites;
}

// ユーザーのお気に入りに登録済みの本のisbnを一覧で返す関数
function getUserFavoriteIsbnList($user_id)
{
    $pdo = connect_db();

    $sql = 'SELECT DISTINCT book_id
            FROM favorites_table
            WHERE user_id = :user_id';

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':user_id', $user_id);
    $stmt->execute();

    // $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // $res = array_column(
    //     $stmt->fetchAll(PDO::FETCH_ASSOC),
    //     'book_id'
    // );

    // var_dump($user_id);
    // exit();

    return array_column(
        $stmt->fetchAll(PDO::FETCH_ASSOC),
        'book_id'
    );
}


// ユーザーIDごとにお気に入りポイントをすべて取得する関数
function getUserPoints($user_id)
{
    // SQL接続
    $pdo = connect_db();
    $sql = 'SELECT category, goodPoint 
        FROM good_point_table 
        WHERE user_id = :user_id';
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
    $stmt->execute();

    try {
        $status = $stmt->execute();
    } catch (PDOException $e) {
        echo json_encode(["sql error" => "{$e->getMessage()}"]);
        exit();
    }

    // SQL実行の処理
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// お気に入りポイントを格納した連想配列をカウントして多い順に並び変えて、
// その合計数も追加して返す
function dataSort(array $data): array
{
    $map = [];

    // ① 集計
    foreach ($data as $item) {
        $key = $item['goodPoint'];

        if (!isset($map[$key])) {
            $map[$key] = [
                'category'  => $item['category'],
                'goodPoint' => $item['goodPoint'],
                'count'     => 0
            ];
        }

        $map[$key]['count']++;
    }

    // ② 配列に変換
    $result = array_values($map);

    // ③ countの多い順にソート
    usort($result, function ($a, $b) {
        return $b['count'] <=> $a['count'];
    });



    return $result;
}

// 上二つの処理を連続で行ってソート済みのデータを取得する
function getUserSortedPoints($user_id)
{
    $goodPoints = getUserPoints($user_id);
    return dataSort($goodPoints);
}

// 本のお気に入りポイントを取得して配列にして返す（１冊、全件両対応）
function getBookPoints($book_id = null)
{
    $pdo = connect_db();

    // SQL接続
    if ($book_id) {
        // isbn情報があるとき１冊分取得
        // $sql = 'SELECT isbn, category, goodPoint
        //         FROM good_point_table
        //         WHERE isbn = :isbn';
        $sql = 'SELECT book_id, category, goodPoint
                FROM good_point_table
                WHERE book_id = :book_id';

        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':book_id', $book_id);
    } else {
        // isbn情報がない時全件取得
        $sql = 'SELECT book_id, category, goodPoint
                FROM good_point_table';
        $stmt = $pdo->prepare($sql);
    }
    $stmt->execute();

    try {
        $status = $stmt->execute();
    } catch (PDOException $e) {
        echo json_encode(["sql error" => "{$e->getMessage()}"]);
        exit();
    }

    // SQL実行のして値を返す
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// 全権取得したデータから本ごとの情報をまとめる関数
function groupBookPointsByIsbn($rows)
{
    $books = [];

    foreach ($rows as $row) {
        $book_id = $row['book_id'];
        $point = $row['goodPoint'];

        if (!isset($books[$book_id])) {
            $books[$book_id] = [
                'book_id' => $book_id,
                'points' => []
            ];
        }

        $books[$book_id]['points'][$point] =
            ($books[$book_id]['points'][$point] ?? 0) + 1;
    }

    return $books;
}

// ユーザーの評価基準に合わせて評価値を計算する関数
function calculateRecommendationScores($userPoints, $books)
{
    $result = [];

    foreach ($books as $book) {
        $score = 0;
        $maxContribution = 0;
        $bestPoint = '';
        $bestCategory = '';

        foreach ($userPoints as $u) {
            $point = $u['goodPoint'];

            if (!isset($book['points'][$point])) continue;

            $contribution = $u['count'] * $book['points'][$point];
            $score += $contribution;

            if ($contribution > $maxContribution) {
                $maxContribution = $contribution;
                $bestPoint = $point;
                $bestCategory = $u['category'];
            }
        }

        if ($score > 0) {
            $result[] = [
                'book_id' => $book['book_id'],
                'score' => $score,
                'reason' => [
                    'category' => $bestCategory,
                    'point' => $bestPoint
                ]
            ];
        }
    }

    usort($result, fn($a, $b) => $b['score'] <=> $a['score']);

    return $result;
}

// isbnのリストを受け取って表示用のミニマムデータを返す
function getBookInfoByIsbnList($isbnList)
{
    if (empty($isbnList)) return [];

    $pdo = connect_db();

    // IN句用に ?,?,? を作る
    $placeholders = implode(',', array_fill(0, count($isbnList), '?'));

    $sql = "
        SELECT DISTINCT id, title, largeImageUrl
        FROM books
        WHERE id IN ($placeholders)
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($isbnList);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// 文字列を受け取って改行文字などをスペースに置き換える関数
function sanitizeForCsv($str)
{
    return str_replace(["\r\n", "\r", "\n"], " ", $str);
}
