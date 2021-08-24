/** Tweetチェックしてwebhookに */
function tweetCheck(misch, query) {
  var json = getTimeLine(query);
  // 新>古の順になっているので入れ替える
  json.reverse();

  // 一致チェック用データにidのみを2次元配列で抽出
  var ids = json.map(tweet => [tweet['id_str']]);

  // シートの準備
  let sheet = getSheet(misch.sheetId, misch.sheetName);
  let range = getRange(sheet, misch.rows);
  // 一致チェック
  var checkedData = checkFinished(range, ids, misch.checkRow);

  // post処理
  if (checkedData.length > 0) {
    // 二次元配列から単純な配列に変更
    var checkedIds = [];
    checkedData.forEach(data => checkedIds.push(data[0]));

    // [{id:id_str, embeds:[{...}]}] のオブジェクトの生成
    var contents = createPostContents(json, checkedIds, misch.reply);

    try {
      //discordにpost
      postTweets(misch.webhook, misch.name, contents);
      // シートに保存
      setRead(range, ids);
    } catch(err) {
      console.error('error ids : ' + err);
      postTweetError(err, range, ids);
    }
  } else {
    console.log('既存データのみ');
  }
}

/** ポストするデータ作成 */
function createPostContents(tweets, allowIds, excludeReplies) {
  var contents = [];
  tweets.forEach(tweet => {
    var id = tweet['id_str'];
    if (allowIds.includes(id)) {
      var obj = {};
      obj.id = id;
      // 分岐用フラグ
      var notRt = tweet['retweeted_status'] == undefined;

      // リプライ除外
      if (isReply(tweet) && excludeReplies == false) {
        // リプライ かつ リプライ除外設定のとき
        if (tweet['user']['screen_name'] !== tweet['in_reply_to_screen_name']) {
          // 同アカウント以外へのリプライのとき次の処理へ
          console.log('他アカウントへのリプライ : ' + id + ', @' + tweet['in_reply_to_screen_name']);
          return;
        }
      }
      // RTでない かつ リプライもしくは引用の場合に埋め込みを作成する
      if (notRt && (isReply(tweet) || isQuote(tweet))) {
        var tweetUrl = generateTweetLink(misch.name, id);
        obj.embeds = createEmbeds(tweet, tweetUrl);
      }
      contents.push(obj);

      // アニメーションgif添付の場合動画のURLを取得し単品で追加する
      if (tweet['extended_entities'] != undefined) {
        if (tweet['extended_entities']['media'][0]['type'] == 'animated_gif') {
          contents.push(postUrlObject(id, tweet['extended_entities']['media'][0]['video_info']['variants'][0]['url']));
        }
      }

      // youtubeリンクが含まれる場合youtubeリンクを追加する
      var tweetText;
      if (notRt) {
        tweetText = deleteShortUrl(
          tweet['full_text'],
          tweet['entities']['urls']
        );
      } else {
        // RTの場合retweeted_statusのfull_textでないと全文取得できない
        tweetText = deleteShortUrl(
          tweet['retweeted_status']['full_text'],
          tweet['retweeted_status']['entities']['urls']
        );
      }
      var shortUrls = extractShortUrl(tweetText);
      console.log(id);
      console.log(shortUrls);
      if (shortUrls != undefined) {
        var urls = expandShortUrl(shortUrls);
        const youtubeUrl = 'https://www.youtube.com/';
        const youtubeShortUrl = 'https://youtu.be/';
        urls.forEach(url => {
          if (url.startsWith(youtubeUrl) || url.startsWith(youtubeShortUrl)) {
            contents.push(postUrlObject(id, url));
          }
        });
      }
    }
  });

  console.log(contents);
  return contents;
}

/** twitter用リンク作成 */
function generateTweetLink(name, id) {
  return 'https://twitter.com/'+ name +'/status/' + id;
}

/** 連続でpost */
function postTweets(webhook, name, contents) {
  var err = [];
  contents.forEach(content => {
    var text = '';
    if (content['url'] != undefined) {
      text = content['url'];
    } else {
      text = generateTweetLink(name, content['id']);
    }
    var payload = {};
    payload.content = text;
    if (content['embeds'] != undefined) {
      payload.embeds = content['embeds'];
    }
    try {
      console.log('送信 : ');
      console.log(payload);

      postDiscord(webhook, payload);
      // 0.8秒停止
      Utilities.sleep(800);
    } catch (e) {
      // discordエラー時
      console.warn(e);
      err.push(content['id']);
    }
  });

  if (err.length > 0) {
    throw err;
  }
}

/**
 * postエラー時の処理
 * 取得結果から失敗tweetを除いて保存
 */
function postTweetError(err, range, ids) {
  for (var i = 0; i < ids.length; i++) {
    // 値を取得
    var value = ids[i][0];
    if (value.length > 0) {
      // post失敗したものを空白の配列で上書き
      err.forEach(errorTweet => {
        if (value == errorTweet) {
          ids[i] = [''];
          console.log('除去 : ' + errorTweet);
        }
      });
    }
  }
  console.log(ids);
  // 保存
  setRead(range, ids);
}