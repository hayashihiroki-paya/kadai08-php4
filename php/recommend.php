<?php

include('functions.php');
require './auth_check.php';
checkSessionId();
// echo "ユーザーデータ取得処理開始";
// ログイン情報ない時終了
// if (!isset($_SESSION["userID"]) || $_SESSION["userID"] === "") {
//     // echo json_encode("ログイン情報なし", JSON_UNESCAPED_UNICODE);
//     exit();
// }

// $userID = $_SESSION["userID"];

// ソート済みのユーザーデータを取得
$userPoints = getUserSortedPoints($user_id);
// 本の全部のデータを取得
$rawBookData = getBookPoints();
// book_idごとに情報をまとめる
$books = groupBookPointsByIsbn($rawBookData);

// ユーザーのお気に入りポイントと本のデータをすり合わせて評価値を計算する
$recommendations = calculateRecommendationScores($userPoints, $books);

// すでにお気に入り登録済みの本のisbn情報をまとめる
$userFavoriteIsbn = getUserFavoriteIsbnList($user_id);
// book_idがキーとなるように変換
$favoriteMap = array_flip($userFavoriteIsbn);

// var_dump($favoriteMap);
// exit();

$filtered = []; // ダブったものを除いたリストを格納する
foreach ($recommendations as $rec) {
    // echo "b";
    // 評価値計算リストrecommendationsのisbnと、ユーザー登録済みisbnが一致したら処理を飛ばす
    if (isset($favoriteMap[$rec['book_id']])) continue;
    // ダブってないのでリストに追加
    // echo "a";
    $filtered[] = $rec;
}
// 上書きする
$recommendations = $filtered;
// var_dump($recommendations);
// exit();

// book_id一覧を作る
$isbnList = array_column($recommendations, 'book_id');

// 本の表示情報を取得
$bookInfoList = getBookInfoByIsbnList($isbnList);

// isbn をキーに変換
$bookInfoMap = [];
foreach ($bookInfoList as $info) {
    $bookInfoMap[$info['id']] = $info;
}


// 表示用データにまとめる
$viewData = [];
foreach ($recommendations as $rec) {
    $book_id = $rec['book_id'];

    if (!isset($bookInfoMap[$book_id])) continue;

    $viewData[] = [
        'book_id'  => $book_id,
        'title' => $bookInfoMap[$book_id]['title'],
        'largeImageUrl' => $bookInfoMap[$book_id]['largeImageUrl'],
        'score' => $rec['score'],
        'reason' => $rec['reason']
    ];
}

echo json_encode($viewData, JSON_UNESCAPED_UNICODE);

// echo json_encode($recommendations, JSON_UNESCAPED_UNICODE);