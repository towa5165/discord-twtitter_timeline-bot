
function isReply(tweet) {
  return tweet['in_reply_to_status_id'] != null;
}

function isQuote(tweet) {
  return tweet['is_quote_status'];
}

/** 短縮URL抽出 */
function extractShortUrl(text) {
  // 短縮URLパターン
  var shortUrlReg = /https:\/\/t.co\/\w+/g;
  // URLチェック
  return text.match(shortUrlReg);
}

/** 短縮URLの展開 */
function expandShortUrl(urls) {
  // リクエストパラメータの作成
  var request = [];
  urls.forEach(url => {
    var param = {
      'url':url,
      'method':'GET',
      'followRedirects':false
    }
    request.push(param);
  })

  try {
    // 取得
    var responseArray = UrlFetchApp.fetchAll(request);

    // URLの取得
    var urls = [];
    responseArray.forEach(response => {
      urls.push(response.getAllHeaders()['Location']);
    })

    return urls;
  } catch(e) {
    console.error(e);
  }
}

/** URL単品でpostするときのオブジェクト */
function postUrlObject(id, url) {
  return {id : id, url : url};
}

