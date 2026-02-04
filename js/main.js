// =====================================
// ページ読み込み時の処理
// =====================================

// ページ更新時に保存したデータの一覧表示を行い、取得したデータを保存する
// 保存するための空の配列
let favoriteBookList = [];
let favoriteIsbnList = [];
// 保存したデータをとってきて上の配列に入れつつ表示まで行う
loadBookList();

// スマホ向け、長押し判定用
let longPressTimer = null;
const LONG_PRESS_TIME = 500; // ms


// ボタンの見た目をjQuery UI で設定
// $(".button").button();


// =====================================
// 検索ボタンがクリックされたとき
// =====================================

// データ格納用の空配列
let selectionData = [];
$("#searchButton").on('click', async function () {
    // await処理中にボタンの表示を変える
    $("#searchButton").text("検索中・・・");
    // selectionData初期化
    selectionData.splice(0, selectionData.length);
    // console.log("searchButtonクリックされました");
    const queryText = $("#searchWord").val();
    // 検索ワードをAPIに投げる 今回は楽天のアプリケーションIDが必要だった
    // Vercelを使ってキーを秘匿します
    await axios.get("https://kadai05-api-kohl.vercel.app/api/rakuten", {
        params: { title: queryText, booksGenreId: "001017" }
    }).then(res => {
        // console.log(res.data.Items);
        const originalData = res.data.Items;

        // 検索結果の配列を渡すと、必要な情報だけ引っこ抜いた配列を返してくれる関数
        selectionData = searchData(originalData);
        // console.log("selectionData一回目", selectionData);


    });

    // ジャンル指定がもう一つしないと抜けが多かったので追加
    await axios.get("https://kadai05-api-kohl.vercel.app/api/rakuten", {
        params: { title: queryText, booksGenreId: "001004008" }
    }).then(res => {
        // console.log(res.data.Items);
        const originalData = res.data.Items;

        // 検索結果から必要なデータを抜いて、前の条件で検索したものに統合する
        selectionData = selectionData.concat(searchData(originalData));
        // console.log("selectionData二回目", selectionData);

        // 検索終わったので元に戻す
        $("#searchButton").text("検索");

        // 配列を渡して中身を描画してくれる関数
        viewData(selectionData);
    });

})



// =====================================
// お気に入りゾーンにドロップされたときの処理（データ保存する）
// =====================================

$("#favorite").droppable({
    drop: async function (e, ui) {

        // ドラッグしてきた要素の情報を格納
        const $original = ui.draggable;
        // 何番目の要素かを取得
        const index = $(".viewBlock").index($original);
        // 確認
        // console.log("何番目のviewBlockか:", index);
        // console.log("対応する検索結果情報:", selectionData[index]);

        // favorite_save.php に情報を送って保存
        // スマホの時別方法で発火させるので関数化しました
        await saveFavoriteByIndex(index);
        // await $.post("php/favorite_save.php", {
        //     bookData: selectionData[index]
        // }, function (res) {
        //     console.log("res", res);
        //     loadBookList();
        // });

        // console.log("保存処理終了");

    }
});

// あらすじ全体表示ボタン
$(document).on('click', '.toggleCaption', function (e) {
    // console.log("クリック判定");
    e.stopPropagation(); // 親のclickを止める
    $(this).closest('.viewBlock').toggleClass('is-open');
});


// =====================================
// スマホ用 検索結果長押しで詳細表示
// =====================================
$(document).on("touchstart", ".viewBlock", function (e) {
    // console.log("長押し開始");

    if (!isMobile()) return;

    const $block = $(this);

    longPressTimer = setTimeout(() => {
        showDetailFromBlock($block);
    }, LONG_PRESS_TIME);
});

// キャンセル処理
$(document).on("touchend touchmove", ".viewBlock", function () {
    // console.log("長押しキャンセル");
    if (!isMobile()) return;

    clearTimeout(longPressTimer);
    longPressTimer = null;
});

// 開いているところタップで閉じる
$(document).on("click", ".viewBlock.showDetail", function () {
    // console.log("タップで閉じる");
    if (!isMobile()) return;

    $(this).removeClass("showDetail");
});



// =====================================
// スマホ用 お気に入り登録ボタンを押したときの処理
// =====================================
$(document).on("click", ".favoriteAddButton", async function (e) {
    e.stopPropagation();

    // console.log("お気に入り登録ボタン押した");
    if ($(this).prop("disabled")) return;

    const $block = $(this).closest(".viewBlock");
    const index = $(".viewBlock").index($block);

    await saveFavoriteByIndex(index);

    $(this)
        .text("✓ 登録済み")
        .prop("disabled", true);

    $block.addClass("alreadyFavorite");
});



// =====================================
// お気に入り削除ボタンクリック時の処理（データ削除）
// =====================================
$(document).on("click", ".deleteBtn", async function () {
    // console.log("削除ボタンクリックされました");

    // deleteBtnに持たせていたbook_idの情報を取得
    const book_id = $(this).data("book_id");

    // 削除は特に誤操作したくないと思うのでポップアップ出します
    if (!confirm("削除しますか？")) return;

    // 
    await $.post("php/favorite_delete.php", {
        book_id: book_id
    }, function (res) {
        // console.log("res", res);
        loadBookList();
        alert("削除しました");
        // 詳細画面を消す
        $("#detailedInformation").css('display', 'none');
    });
});

// =====================================
// スマホ表示中のお気に入り表示切替ボタン
// =====================================
$("#favoriteToggle").on("click", function () {
    favoriteToggle();
});


// =====================================
// 保存済みデータクリック時の処理（詳細情報、コメント記入欄表示）
// =====================================
$(document).on("click", ".favoriteItem", async function () {

    // お気に入り一覧を消す
    favoriteToggle();

    // console.log("保存済みデータクリックされました");
    // 保存リスト何番目か取得
    const index = $(".favoriteItem").index(this);

    // 詳細情報画面を表示する
    $("#detailedInformation").css('display', 'block');
    $("#detailedInformation").css('z-index', '99');

    // htmlの中身を作成する
    let html =
        `<div>
            <h3 class="detailedTitle">${favoriteBookList[index].title}</h3>
            <div><img src="${favoriteBookList[index].largeImageUrl}" alt="${favoriteBookList[index].title}の表紙"></div>
            <p>${favoriteBookList[index].author}</p>
            <p>${favoriteBookList[index].itemCaption}</p>
            <p>${favoriteBookList[index].publisherName}</p>
            <p>${favoriteBookList[index].salesDate}</p>
            <p>${favoriteBookList[index].seriesName}</p>
        </div>
        <hr>
        <div>
            <div class = "operationButtons">
                <button class="closeBtn button">詳細画面を閉じる</button>
                <button class="deleteBtn" data-book_id="${favoriteBookList[index].book_id}">お気に入りから削除</button>
            </div>
            <hr>
            <div class="goodPointTabs">
                <button class="tab active button inputButton" data-book_id="${favoriteBookList[index].book_id}" data-tab="input">✍️ ココ好き！を入力する</button>
                <button class="tab button" data-tab="registered">📌 登録済みのココ好き！</button>
                <button class="tab button statisticsButton" data-tab="stats" data-book_id='${favoriteBookList[index].book_id}'>📊 みんなの傾向</button>
                <button class="tab" data-tab="comment">💭 コメント</button>
            </div>
            <div class="tabContents">
                <div class="tabPanel active" id="tab-input">
                    <div id="categoryBox"></div>
                    <div id="goodPointElements"></div>
                    <button class="saveButton button" data-book_id="${favoriteBookList[index].book_id}" data-title="${favoriteBookList[index].title}">★ 保存する ★</button>
                </div>
                <div class="tabPanel" id="tab-registered">
                    <div id="registeredView" ></div>
                </div>
                <div class="tabPanel" id="tab-stats">
                    <div id="statisticsView" ></div>
                </div>
                <div class="tabPanel" id="tab-comment">
                    <p id="comment">`;
    // console.log("favoriteBookList[index].comment", favoriteBookList[index].comment);
    // commentの情報があるときは表示する
    if (favoriteBookList[index].comment) {
        html += favoriteBookList[index].comment;
    }
    html +=
        `</p>
                    <div><input id="commentText" type="textarea" class="textInput"></div>
                    <button class="commentBtn button" data-book_id="${favoriteBookList[index].book_id}">コメントする</button>
                    <button class="commentDeleteBtn button" data-book_id="${favoriteBookList[index].book_id}">コメント削除</button>
                </div>
            </div>
        </div>
        `;

    // 詳細画面にhtmlを反映する
    $("#detailedInformation").html(html);
    $(".saveButton").css("display", "none");

    // 登録済みココ好きポイントをregisteredViewに表示する
    // book_idを送ってカテゴリ名と詳細項目を配列で返してもらう
    // 関数化します
    // console.log("favoriteBookList[index].book_id",favoriteBookList[index].book_id);
    goodPointRead(favoriteBookList[index].book_id);

    // 作成したボタンをUIデザインに変更する
    // $(".button").button();
});


// 変更前のメモ
// <div id="goodPoint">
// <button class="inputButton button">ココ好き！ を入力する</button>
// <button class="statisticsButton button" data-isbn="${favoriteBookList[index].isbn}">みんなの ココ好き！ を見る</button>
// <div id="categoryBox"></div>
// <div id="goodPointElements"></div>
// <button class="saveButton button" data-isbn="${favoriteBookList[index].isbn}" data-title="${favoriteBookList[index].title}">保存する</button>
// <div id="goodPointView">
// <div id="registeredView" ></div>
// <div id="statisticsView" ></div>
// </div>  
// </div>


// ===============================
// ココ好きタブ切り替え
// ===============================
$(document).on("click", ".goodPointTabs .tab", function () {

    $(".inputButton").text("✍️ ココ好き！を入力する")
    const target = $(this).data("tab"); // input / registered / stats

    // タブの active 切り替え
    $(".goodPointTabs .tab").removeClass("active");
    $(this).addClass("active");

    // パネルの active 切り替え
    $(".tabPanel").removeClass("active");
    $("#tab-" + target).addClass("active");
});


// =====================================
// ココ好きポイント 入力操作（入力項目がボタンの選択肢で表示される 親項目からネストで子項目が出てくる）
// =====================================
// 入力内容を保存する（複数選択できるように配列）
const goodPointInput = [];
// カテゴリ表示
$(document).on("click", ".inputButton", function () {
    const book_id = $(this).data("book_id");
    $("#categoryBox").html(""); // いったんリセットする
    $("#goodPointElements").html(""); // いったんリセットする
    $(".inputButton").text("✍️ ココ好き！ 入力中・・・"); // ボタンの表示変更
    $(".inputButton").addClass("selected"); // 選択中表示色変え
    goodPointInput.splice(0, goodPointInput.length); // 初動操作なので保持データリセット

    // categoryのリスト（後から増やしても動くように作る）
    const categoryList = [
        "ジャンル",
        "主人公",
        "設定",
        "関係性",
        "雰囲気・作風",
        "展開・構成",
        "チート・能力"
    ];

    // 入力用のボタンを作る data属性にカテゴリ名保持
    let html = "<p>大項目（カテゴリ）を選択してください</p>";
    for (let i = 0; i < categoryList.length; i++) {
        html += `<button class='categoryButton button' data-book_id="${book_id}" data-category=${categoryList[i]}>${categoryList[i]}</button>`
    }


    // htmlを反映してボタン追加
    $("#categoryBox").html(html);

    // 作成したボタンをUIデザインに変更する
    // $(".button").button();
});

// 詳細項目表示
$(document).on("click", ".categoryButton", function () {
    const book_id = Number($(this).data("book_id"));
    // console.log("book_id",book_id);
    $(".categoryButton").each(function () {
        $(this).removeClass("selected");
    });
    $(this).addClass("selected");
    const category = $(this).data('category');
    // categoryの文字列に応じて小項目ボタンを生成する関数
    generateGoodPointButton(category, book_id);

});

// 詳細項目選択 goodPointButton
$(document).on("click", ".goodPointButton", async function () {

    const $btn = $(this);
    const book_id = $(this).data('book_id');

    if ($btn.prop("disabled")) return;

    // const isbn = currentIsbn; // 既に持ってる前提
    const category = $btn.data("category");
    const point = $btn.data("point");
    const isSelected = $btn.data("selected");

    // 通信中ロック
    $btn.prop("disabled", true);

    try {

        if (!isSelected) {
            // ===== 保存 =====
            await saveGoodPoint({ book_id, category, goodPoint: point });

            $btn
                .addClass("selected")
                .data("selected", true);

        } else {
            // ===== 削除 =====
            await deleteGoodPoint({ book_id, category, goodPoint: point });

            $btn
                .removeClass("selected")
                .data("selected", false);
        }

    } catch (e) {
        alert("保存に失敗しました");
    } finally {
        $btn.prop("disabled", false);
    }
});

// $(document).on("click", ".goodPointButton", function () {

//     const category = $(this).data('category');
//     const text = $(this).text();
//     // console.log("category + text :", category + " + " + text);

//     // 重複してたら取り消す
//     const flag = {
//         add: true, // 追加フラグ
//         removeNumber: -1 // 削除するときの配列番号 初期値は存在しない数値にしとく
//     }
//     for (let i = 0; i < goodPointInput.length; i++) {
//         // console.log(goodPointInput[i]);
//         if (goodPointInput[i][0] === category && goodPointInput[i][1] === text) {
//             // リストにあるものがもう一度押されたので削除する
//             flag.add = false; // 追加をオフで削除処理
//             flag.removeNumber = i; // 削除する配列番号を格納
//             break;
//         }
//     }

//     // 重複してなければリストに追加
//     if (flag.add) {
//         // ココ好きポイントの追加リストに追加
//         goodPointInput.push([category, text]);
//         // ボタンの文字に色を付ける
//         $(this).addClass("selected");
//     } else {
//         // リストから削除
//         goodPointInput.splice(flag.removeNumber, 1);
//         // ボタンの文字も戻す
//         $(this).removeClass("selected");
//     }
//     // console.log("goodPointInput:", goodPointInput);

//     // リストの情報があるとき保存ボタンを表示
//     if (goodPointInput.length > 0) {
//         $(".saveButton").css("display", "block");
//     } else {
//         $(".saveButton").css("display", "none");
//     }

// });




// =====================================
// ココ好き統計ボタン
// =====================================
$(document).on("click", ".statisticsButton", async function () {
    $("#statisticsView").css("display", "block");

    // alert("click");
    const book_id = $(this).data("book_id");
    // good_points_tableからuserIDごとの情報をまとめて取得する
    await $.post("php/book_data_read.php", {
        book_id: book_id
    }, function (res) {
        // お気に入りポイントを多い順、カウント付きで取得
        const bookData = JSON.parse(res);

        // console.log("bookData", bookData);

        // 項目ごとに多い順に並び替えして、件数も付与した配列を返す関数
        // もとからソートしたデータが来るようにしたので消します
        // const sortData = dataSort(bookData);

        // countが大きい順に並んだので表示していく
        let html = `
            <p class="statisticsTitle">みんなの好みの傾向</p>
            <div class="statisticsList">
        `;

        for (let i = 0; i < bookData.length && i < 5; i++) {
            html += `
                <div class="statisticsItem">
                    <span class="rankBadge rank${i + 1}">
                        ${i + 1}
                    </span>
                    <span class="statisticsCategory">
                        ${bookData[i].category}
                    </span>
                    <span class="statisticsValue">
                        ${bookData[i].goodPoint}
                    </span>
                </div>
            `;
        }

        html += `</div>`;

        $("#statisticsView").html(html);


    });
});

// =====================================
// コメントボタンクリック時の処理（データ追加）
// =====================================
$(document).on("click", ".commentBtn", async function () {

    // console.log("コメントボタンクリックされました");

    // 保存中にボタンの表示を変更する
    $(".commentBtn").text("保存中・・・");

    // book_id取得
    const book_id = $(this).data("book_id");

    // コメント入力内容を取得
    const comment = $('#commentText').val();

    await $.post("php/favorite_update.php", {
        book_id: book_id,
        comment: comment
    }, function (res) {
        // console.log("res", res);
        alert("コメントを保存しました！");
        $("#comment").text(comment); // コメント欄に表示
        $('#commentText').val(""); // 入力欄クリア
        $(".commentBtn").text("コメントする"); // 保存終わったのでボタンの表示を戻す
        loadBookList();
    });

});



// =====================================
// コメント削除クリック時の処理（commentデータを空文字で上書き）
// =====================================
$(document).on("click", ".commentDeleteBtn", async function () {

    // 削除中にボタンの表示を変更する
    $(".commentDeleteBtn").text("削除中・・・");

    // book_id取得
    const book_id = $(this).data("book_id");

    // コメントを空文字に変更するので渡す変数を空文字にする
    const comment = "";

    await $.post("php/favorite_update.php", {
        book_id: book_id,
        comment: comment
    }, function (res) {
        // console.log("res", res);
        alert("コメントを削除しました！");
        $("#comment").text(comment); // コメント欄に表示
        $('#commentText').val(""); // 入力欄クリア
        $(".commentDeleteBtn").text("コメント削除"); // ボタンの表示を戻す
        loadBookList();
    });
});


// =====================================
// 閉じるボタンクリック時の処理（詳細画面クリアして閉じる）
// =====================================
$(document).on("click", ".closeBtn", async function () {
    $("#detailedInformation").html("");
    $("#detailedInformation").css('display', 'none');
});


// =====================================
// ユーザー詳細情報表示
// =====================================
$(".userDataButton").on("click", async function () {
    // sessionデータからuserID取得して、IDごとの統計情報を返す
    // array = [{category: "世界観", goodPoint: "ファンタジー"},{...}]みたいな
    // good_points_tableからuserIDごとの情報をまとめて取得する
    await $.post("php/user_data_read.php", {
        // 送る情報なし
    }, function (res) {
        // console.log("res", res);
        // ソート済みのデータを取得するように変更しました
        const userData = JSON.parse(res);
        // console.log("userData", userData);
        let allDataCount = 0;
        userData.forEach(element => {
            allDataCount += element.count;
        });

        // 項目ごとに多い順に並び替えして、件数も付与した配列を返す関数
        // 並び替えはphp側で完結するように変更したのでコメントアウト
        // const sortData = dataSort(userData);

        // countが大きい順に並んだので表示していく
        // let html = "<div class='userInfoText'><p>あなたの好みの傾向は・・・</p>";

        // for (let i = 0; i < userData.length && i < 5; i++) {
        //     html += `
        //     <p>${userData[i].category} が ${userData[i].goodPoint} なもの : ${userData[i].count}/${allDataCount}個</p>`;
        // };

        let html = `
            <div class="userStats"><p class="userInfoText">あなたの好みの傾向</p>
            <div class="statisticsList">
        `;

        for (let i = 0; i < userData.length && i < 5; i++) {
            html += `
                <div class="statisticsItem">
                    <span class="rankBadge rank${i + 1}">
                        ${i + 1}
                    </span>
                    <span class="statisticsCategory">
                        ${userData[i].category}
                    </span>
                    <span class="statisticsValue">
                        ${userData[i].goodPoint}
                    </span>
                </div>
            `;
        }

        html += `</div>`;
        // ボタンなど追加
        html += `
        <p class="tips">※上位５件を表示しています</p>
        <button class="closeButton button">閉じる</button>
        <button class="recommendButton button">あなたへのおすすめ作品</button></div>
        <div class='recommendList'></div>`;

        // 枠を表示
        $("#userInformation").css("display", "flex");
        // タグを埋め込む
        $("#userInformation").html(html);

        // 作成したボタンをUIデザインに変更する
        // $(".button").button();

    });
})

// recommendButton おすすめボタンの動作
$(document).on("click", ".recommendButton", async function () {

    await $.post("php/recommend.php", {
        // 送る情報なし
    }, function (res) {
        console.log("res",res);
        const recommendData = JSON.parse(res);
        // console.log("recommendData", recommendData);
        let html = "";
        for (let i = 0; i < recommendData.length; i++) {
            html += `
                <div class="recommendBlock">
                    <h3>${recommendData[i].title}</h3>
                    <div><img src="${recommendData[i].largeImageUrl}" alt="${recommendData[i].title}の表紙"></div>
                    <p class="reason">
                        特に、あなたがよく好む<br>
                        「${recommendData[i].reason.category} が ${recommendData[i].reason.point} な作品」<br>
                        のため、おすすめです
                    </p>
                    <p>おすすめ評価値：${recommendData[i].score}点</p>
                </div>`;
        };
        html += "<p class='tips'>※評価値はあなたのよく選ぶポイントと、作品ごとの選ばれやすいポイントから算出しています<br>お気に入り登録とココ好きポイント入力が多いほどマッチしやすくなります</p>";
        $(".recommendList").html(html);
    });
});

// 閉じるボタンの動作
$(document).on("click", ".closeButton", function () {
    $("#userInformation").html("");
    $("#userInformation").css("display", "none");
});

// =====================================
// 以下、関数まとめ
// =====================================

// 検索結果の配列を渡すと、必要な情報だけ引っこ抜いた配列を返してくれる関数
function searchData(data) {

    // 格納用の空配列作成
    const newData = [];

    // データの数だけ回して必要な情報だけ抜き取る
    for (let i = 0; i < data.length; i++) {
        newData[i] = {
            author: data[i].Item.author,
            authorKana: data[i].Item.authorKana,
            isbn: data[i].Item.isbn,
            itemCaption: data[i].Item.itemCaption,
            largeImageUrl: data[i].Item.largeImageUrl,
            publisherName: data[i].Item.publisherName,
            salesDate: data[i].Item.salesDate,
            seriesName: data[i].Item.seriesName,
            title: data[i].Item.title,
            titleKana: data[i].Item.titleKana,
            comment: "" // コメントを空で用意しておく
        }
    }
    return newData;
}

// 検索結果の配列を渡して中身を描画してくれる関数
function viewData(data) {

    favoriteIsbnList = favoriteBookList.map(book => book.isbn);
    // console.log("favoriteBookList", favoriteBookList);
    // console.log("favoriteIsbnList", favoriteIsbnList);

    // 何件ヒットしたかを表示
    $("#numberOfMatches").text("検索ヒット数：" + data.length + "件");

    // 検索結果のhtmlを作成
    let html = "";
    for (let i = 0; i < data.length; i++) {

        const isbn = data[i].isbn;
        const isFavorite = favoriteIsbnList.includes(isbn);
        html += `
            <div class="viewBlock ${isFavorite ? "alreadyFavorite" : ""}"
                data-isbn="${isbn}">
                <div class="coverArea">
                    <img class="bookCover" src="${data[i].largeImageUrl}" alt="${data[i].title}の表紙">
                </div>
                <div class="detailInfo">
                    <h3 class="bookTitle">${data[i].title}</h3>
                    <p class="bookMeta">
                        <span>${data[i].author}</span><br>
                        <span class="itemCaption">${data[i].itemCaption}</span><button class="toggleCaption">あらすじをもっと見る</button><br>
                        <span>${data[i].publisherName}</span><br>
                        <span>${data[i].salesDate}</span><br>
                        <span>${data[i].seriesName}</span><br>
                    </p>
                </div>
                <button class="favoriteAddButton"
                        ${isFavorite ? "disabled" : ""}>
                    ${isFavorite ? "✓ 登録済み" : "★ お気に入り"}
                </button>
            </div>
            `
    }
    // htmlを反映
    $("#result").css('display', 'grid');
    $("#result").html(html);

    if (!isMobile()) {
        $(".viewBlock").draggable({
            helper: "clone",
            start: function (e, ui) {
                ui.helper.width($(this).width());
                ui.helper.height($(this).height());
            }
        });
    }

    // // ここで作った要素なのでここでドラッグできるように設定する
    // $(".viewBlock").draggable({
    //     helper: "clone", // クローンがドラッグされるようにする
    //     start: function (e, ui) {
    //         ui.helper.width($(this).width()); // クローンはbody直下に生成されるらしいので
    //         ui.helper.height($(this).height()); // %指定だとサイズがおかしくなるので元データのサイズを継承
    //     }
    // });
    // // 画面幅がスマホの時取り消す
    // if (isMobile()) {
    //     console.log("スマホ画面のためドラッグ処理取り消し");
    //     $(".viewBlock").draggable("disable");
    // }
}

// favorites_tableに保存されてるデータを取得する関数
// $_SESSION["userID"] で取得データを絞る
async function loadBookList() {
    // console.log("loadBookList開始");

    await $.post("php/favorite_read.php", {

    }, function (res) {
        // console.log("res", res);
        if (isJson(res)) {
            favoriteBookList = JSON.parse(res);
            // console.log("favoriteBookList", favoriteBookList);
            renderBookList(favoriteBookList);
        }
        // favoriteBookList = JSON.parse(res);
        // // console.log("favoriteBookList", favoriteBookList);
        // renderBookList(favoriteBookList);
    });
}

function isJson(data) {
    try {
        JSON.parse(data);
    } catch (error) {
        return false;
    }
    return true;
}

// 受け取ったお気に入り保存データを一覧表示する関数
function renderBookList(list) {
    $("#favoriteList").empty(); // いったん中身消す

    // console.log("list",list);
    list.forEach(book => {
        $("#favoriteList").append(`
            <div class=" favoriteItem" data-book_id="${book.book_id}">
                <div class="favoriteCover">
                    <img class="favoriteCoverImage" src="${book.largeImageUrl}">
                </div>
                <div class="bookText">
                    <p>${book.title}</p>
                    <p>${book.author}</p>
                </div>
            </div>
        `);
    });
}

// カテゴリ名とisbnを受け取って、小項目ボタンを表示する関数
async function generateGoodPointButton(categoryName, book_id) {

    // console.log("book_id",book_id);
    // 表示リセット
    $("#goodPointElements").html("");
    // 大項目と小項目それぞれ配列番号がそろうように
    // 大項目（カテゴリ）
    const categoryList = [
        "ジャンル",
        "主人公",
        "設定",
        "関係性",
        "雰囲気・作風",
        "展開・構成",
        "チート・能力"
    ];

    // 小項目（お気に入りポイント）
    const goodPointList = [
        // ジャンル
        [
            "ファンタジー",
            "異世界",
            "現代ファンタジー",
            "学園ファンタジー",
            "SF",
            "ミステリー",
            "サスペンス",
            "ラブコメ",
            "恋愛",
            "コメディ",
            "バトル",
            "冒険",
            "ダークファンタジー",
            "戦記・ミリタリー",
            "政治・内政",
            "ホラー",
            "歴史・時代物",
            "スポーツ・競技",
            "群像劇"
        ],

        // 主人公
        [
            "最強",
            "一般人",
            "お人よし",
            "お調子者",
            "野心家",
            "悪人",
            "巻き込まれ体質",
            "おとなしい",
            "権力者",
            "貴族",
            "王族",
            "軍人",
            "商人",
            "職人",
            "奴隷スタート",
            "魔王",
            "魔族",
            "人外主人公",
            "複数主人公",
            "女性主人公",
            "男性主人公",
            "おっさん"
        ],

        // 設定
        [
            "剣と魔法",
            "転生",
            "転移",
            "勇者・聖女召喚",
            "ゲーム世界",
            "ダンジョン",
            "魔法学院",
            "ギルド",
            "王国・帝国",
            "宗教国家",
            "多種族世界",
            "魔法×科学",
            "近未来",
            "星間国家",
            "戦争",
            "現代日本"
        ],

        // 関係性
        [
            "師弟関係",
            "主従関係",
            "幼なじみ",
            "家族",
            "恋人",
            "政略結婚",
            "ハーレム",
            "一途",
            "バディ",
            "ライバル",
            "敵対からの共闘"
        ],

        // 雰囲気・作風
        [
            "明るい",
            "シリアス",
            "ダーク",
            "重厚",
            "ゆるい",
            "日常多め",
            "ギャグ多め",
            "残酷描写あり",
            "心理描写重視",
            "文章が読みやすい"
        ],

        // 展開・構成
        [
            "成り上がり",
            "追放からの逆転",
            "無双",
            "じわじわ強くなる",
            "最初から最強",
            "謎解き要素あり",
            "伏線回収が熱い",
            "テンポが速い",
            "章ごとに盛り上がり"
        ],

        // チート・能力
        [
            "最強チート",
            "生産系チート",
            "鑑定",
            "スキルコピー",
            "時間操作",
            "知識チート",
            "現代知識無双",
            "回復・支援特化",
            "召喚",
            "バフ・デバフ特化"
        ]
    ];


    // 登録済みのお気に入りポンとを取得
    const goodPoints = await getGoodPoints(book_id);
    const goodPointSet = new Set(
        goodPoints.map(gp => `${gp.category}__${gp.goodPoint}`)
    );
    // console.log("goodPointSet",goodPointSet);
    // htmlタグを生成する
    let html = "<p>小項目を選択してください</p>";

    for (let l = 0; l < categoryList.length; l++) {

        if (categoryName !== categoryList[l]) continue;

        for (let i = 0; i < goodPointList[l].length; i++) {

            const point = goodPointList[l][i];
            const key = `${categoryList[l]}__${point}`;
            const isSelected = goodPointSet.has(key);

            html += `
                <button
                    class="goodPointButton button ${isSelected ? "selected" : ""}"
                    data-category="${categoryList[l]}"
                    data-point="${point}"
                    data-selected="${isSelected}"
                    data-book_id="${book_id}"
                >
                    ${point}
                </button>
            `;
        }
    }

    $("#goodPointElements").html(html);

    // 作成したボタンをUIデザインに変更する
    // $(".button").button();
}

// book_id受け取って登録済みのココ好きポイントをオブジェクト配列で返す
async function getGoodPoints(book_id) {
    let goodPoints = []
    await $.post("php/good_point_read.php", {
        book_id: book_id
    }, function (res) {
        // console.log("res:", res);
        // goodPoints = [{category: "ジャンル", goodPoint: "ファンタジー"},{.......}]
        goodPoints = JSON.parse(res);
        // console.log("getGoodPoints goodPoints:", goodPoints);


    });
    // console.log("getGoodPoints goodPoints:", goodPoints);
    return goodPoints;

}


// 詳細画面用に、book_id受け取ってここ好きポイントを表示する
async function goodPointRead(book_id) {
    const goodPoints = await getGoodPoints(book_id);
    let goodPointHtml = "";

    if (goodPoints.length === 0) {
        goodPointHtml = `
                <p class="noGoodPoint">
                    登録済みの「ココ好き！」ポイントはありません
                </p>
            `;
    } else {
        goodPointHtml = `
                <p class="goodPointTitle">登録済みの「ココ好き！」ポイント</p>
                <div class="goodPointList">
            `;

        for (let i = 0; i < goodPoints.length; i++) {
            goodPointHtml += `
                    <div class="goodPointItem">
                        <span class="goodPointCategory">
                            ${goodPoints[i].category}
                        </span>
                        <span class="goodPointValue">
                            ${goodPoints[i].goodPoint}
                        </span>
                    </div>
                `;
        }

        goodPointHtml += `</div>`;
    }

    $("#registeredView").html(goodPointHtml);


    // await $.post("php/good_point_read.php", {
    //     isbn: isbn
    // }, function (res) {
    //     // console.log("res:", res);
    //     // goodPoints = [{category: "ジャンル", goodPoint: "ファンタジー"},{.......}]
    //     const goodPoints = JSON.parse(res);
    //     // console.log("goodPoints:", goodPoints);
    //     let goodPointHtml = "";

    //     if (goodPoints.length === 0) {
    //         goodPointHtml = `
    //             <p class="noGoodPoint">
    //                 登録済みの「ココ好き！」ポイントはありません
    //             </p>
    //         `;
    //     } else {
    //         goodPointHtml = `
    //             <p class="goodPointTitle">登録済みの「ココ好き！」ポイント</p>
    //             <div class="goodPointList">
    //         `;

    //         for (let i = 0; i < goodPoints.length; i++) {
    //             goodPointHtml += `
    //                 <div class="goodPointItem">
    //                     <span class="goodPointCategory">
    //                         ${goodPoints[i].category}
    //                     </span>
    //                     <span class="goodPointValue">
    //                         ${goodPoints[i].goodPoint}
    //                     </span>
    //                 </div>
    //             `;
    //         }

    //         goodPointHtml += `</div>`;
    //     }

    //     $("#registeredView").html(goodPointHtml);

    //     // let goodPointHtml = "";
    //     // for (let i = 0; i < goodPoints.length; i++) {
    //     //     goodPointHtml += `${goodPoints[i].category}:${goodPoints[i].goodPoint} / `;
    //     // }
    //     // if (!goodPointHtml) {
    //     //     goodPointHtml = "登録済みの「ココ好き！」ポイントはありません";
    //     // } else {
    //     //     goodPointHtml = "登録済みの「ココ好き！」ポイント <br> " + goodPointHtml;
    //     // }
    //     // $("#registeredView").html(goodPointHtml);
    // });
}

// DBから取得したココ好きポイントデータを受け取って、多い項目順にソート、何件あるかを追加した配列を返す
function dataSort(data) {

    const map = {};

    // ① 集計
    data.forEach(item => {
        const key = item.goodPoint;

        if (!map[key]) {
            map[key] = {
                category: item.category,
                goodPoint: item.goodPoint,
                count: 0
            };
        }

        map[key].count++;
    });

    // ② 配列に変換してソート
    return Object.values(map).sort((a, b) => b.count - a.count);
}

// お気に入りに保存する処理を関数化
// 検索結果の一覧表示のインデックス番号を受け取って、対応する番号を保存処理に送る
async function saveFavoriteByIndex(index) {
    await $.post("php/favorite_save.php", {
        bookData: selectionData[index]
    }, function (res) {
        // console.log("res", res);
        loadBookList();
    });
}

// 画面幅で使用中のデバイスを設定
function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
}

// お気に入りに登録済みの時のボタンを変更する
function updateFavoriteButton(book_id) {
    const isRegistered = favoriteList.includes(book_id);

    if (isRegistered) {
        $(`.viewBlock[data-book_id="${book_id}"] .favoriteAddButton`)
            .text("✓ 登録済み")
            .prop("disabled", true);
    }
}

// 検索結果の一つを詳細表示する
function showDetailFromBlock($block) {
    // 他のカードを閉じる
    $(".viewBlock").removeClass("showDetail");

    // このカードだけ開く
    $block.addClass("showDetail");
}

// スマホ画面用 お気に入り画面の開閉
function favoriteToggle() {
    $("#favorite").toggleClass("open");

    if ($("#favorite").hasClass("open")) {
        $("#favoriteToggle").text("★ お気に入りを閉じる");
    } else {
        $("#favoriteToggle").text("★ お気に入りを表示");
    }
}

// goodPointButton 保存処理
async function saveGoodPoint(data) {
    // 書籍データを取得
    // console.log("book_id", data.book_id);
    // console.log("category", data.category);
    // console.log("goodPoint", data.goodPoint);

    // 保存処理に送る
    await $.post("php/good_point_save.php", {
        book_id: data.book_id,
        category: data.category,
        goodPoint: data.goodPoint
    }, function (res) {
        // console.log("res", res);

        // 登録済みここ好きポイントを更新して表示する
        goodPointRead(data.book_id);
    });
};

// goodPointButton 削除処理
async function deleteGoodPoint(data) {
    // 書籍データを取得
    // const isbn = $(this).data("isbn");
    // const title = $(this).data("title");
    // console.log("deleteGoodPoint処理開始");

    // 保存処理に送る
    await $.post("php/good_point_delete.php", {
        book_id: data.book_id,
        category: data.category,
        goodPoint: data.goodPoint
    }, function (res) {
        // console.log("res", res);

        // 登録済みここ好きポイントを更新して表示する
        goodPointRead(data.book_id);
    });
};