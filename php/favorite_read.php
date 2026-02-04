<?php
// ユーザーIDを受け取って、ユーザーごとのお気に入りポイントを配列にして返します
include('functions.php');
require './auth_check.php';
checkSessionId();

// ユーザーIDからお気に入り登録済みデータを取得する
$favorites = getUserFavoriteData($user_id);

echo json_encode($favorites, JSON_UNESCAPED_UNICODE);
