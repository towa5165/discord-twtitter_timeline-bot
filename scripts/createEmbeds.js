/** 埋め込み作成 */
function createEmbeds(tweet, url) {
  var embeds = [{}];
  embeds[0].url = url;
  embeds[0].description = deleteShortUrl(tweet['full_text'], tweet['entities']['urls']);
  embeds[0].author = createEmbedsAuthor(tweet['user']);

  // フィールドに追加
  var fields = createEmbedsField(tweet);
  if (fields.length > 0) {
    embeds[0].fields = fields;
  }

  // 画像の追加処理
  if (tweet['entities']['media'] != undefined) {
    // 単体で表示する画像
    embeds[0].image = {url : tweet['entities']['media'][0]['media_url_https']};
  }
  if (tweet['extended_entities'] != undefined) {
    // 連結して表示する画像
    var media = tweet['extended_entities']['media'];
    media.forEach(item => {
      var mediaUrl = item['media_url_https'];
      // 単体の方に追加してないもののみ追加する
      if (embeds[0].image.url != mediaUrl) {
        var content = {url : url, image : {url:mediaUrl}};
        embeds.push(content);
      }
    });
  }
  embeds[0].timestamp = changeAt(tweet['created_at']);
  return embeds;
}

/** 
 * 自動で付与される当該ツィートへの短縮URLを削除する
 * text テキスト
 * urls entities.urls
 */
function deleteShortUrl(text, urls) {
  // URL抽出
  var shortUrls = extractShortUrl(text);
  // entities.urls からユーザーに入力されたURLを取得する
  var useUrls = [];
  if (urls != undefined) {
    useUrls = urls.map(obj => obj.url);
  }
  // URLチェック
  if (shortUrls != null) {
    shortUrls.forEach(url => {
      // entities.urlsにないURLの場合除去
      if (!useUrls.includes(url)) {
        text = text.replace(url, '');
      }
    })
    // 末尾の空白を削除
    text = text.replace(/\s+$/, '');
  }
  return text;
}

/** Embedのユーザー部分作成 */
function createEmbedsAuthor(user) {
  var author = {};
  author.name = user['name'] + '(@' + user['screen_name'] + ')';
  author.icon_url = user['profile_image_url_https'];
  author.url = 'https://twitter.com/'+ user['screen_name'];
  return author;
}

/** Embedsのfield作成 */
function createEmbedsField(tweet) {
  var fields = [];

  // リプライのField作成
  if (isReply(tweet)) {
    // リプライ先取得
    var specifyTweetQuery = {
      screen_name : tweet['in_reply_to_screen_name'],
      exclude_replies : 'false',
      max_id : tweet['in_reply_to_status_id_str'],
      count : 1
    }
    try {
      var reply = getTimeLine(specifyTweetQuery)[0];

      // 引用形式に
      replyText = textAddQuote(reply['text']);
      // 追加
      fields.push({name : '@' + reply['user']['screen_name'], value : replyText});
    } catch(e) {
      console.error(e);
      console.error('リプライ先取得時にエラー id : ' + tweet['id_str']);
    }
  }

  // 引用のFiled作成
  if (isQuote(tweet)) {
    var quoted = tweet['quoted_status'];
    // 不要な短縮URL削除
    var quotedText = deleteShortUrl(quoted['full_text'], quoted['entities']['urls']);
    // 引用形式に
    quotedText = textAddQuote(quotedText);
    // 追加
    fields.push({name : quoted['user']['name'], value : quotedText});
  }

  return fields;
}

/** 文字列を引用形式にして返す */
function textAddQuote(text) {
  var quoted = text.replaceAll('\n', '\n> ');
  return '> ' + quoted;
}

/** Embed用にTwitterの日時フォーマット変換 */
function changeAt(createdAt) {
  // Twitter日時フォーマット (created_at)
  // UTC time when this Tweet was created.
  // Sat Jul 17 15:16:27 +0000 2021

  var splitAt = createdAt.split(' ');
  // スペースで区切り
  // DoW month day hh:mm:ss timezone year
  // 0   1     2   3        4        5
  var year = splitAt[5];
  var month = monthToNumberStr(splitAt[1]);
  var day = splitAt[2];
  var hms = splitAt[3];

  // discord日時フォーマット
  // 2020-01-18T00:00:00+09:00
  return year + '-' + month + '-' + day + 'T' + hms + '+00:00';
}

function monthToNumberStr(month) {
  switch(month) {
    case 'Jan' : return '01';
    case 'Feb' : return '02';
    case 'Mar' : return '03';
    case 'Apr' : return '04';
    case 'May' : return '05';
    case 'Jun' : return '06';
    case 'Jul' : return '07';
    case 'Aug' : return '08';
    case 'Sep' : return '09';
    case 'Oct' : return '10';
    case 'Nov' : return '11';
    case 'Dec' : return '12';
  }
}