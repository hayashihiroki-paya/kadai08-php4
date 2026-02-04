<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    header('Location: ../index.php');
    exit;
}

$userID   = $_SESSION['userID'];
$user_id  = $_SESSION["user_id"];
// $userName = $_SESSION['userName'] ?? '';
