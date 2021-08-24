/** タイムライン取得 */
function getTimeLine(query) {
  var keys = Object.keys(query);
  var url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
  for (var i = 0; i < keys.length; i++) {
    if (i == 0) {
      url += '?';
    } else {
      url += '&';
    }
    url += keys[i] + '=' + query[keys[i]];
  }
  console.log('request : ' + url);

  var twitterService = getService();
  if (twitterService.hasAccess()) {
    // タイムライン取得
    var twMethod = { method:"GET" };
    var json = twitterService.fetch(url, twMethod);
    return JSON.parse(json);
  } else {
    console.error(service.getLastError());
  }
}

/** デフォルトクエリ */
function twitterDefaultQuery(screenName) {
  return {
    screen_name : screenName, //ユーザー表示ID
    count : MAX_NUM, // 取得数
    exclude_replies : 'false', // リプライを除外しない
    tweet_mode : 'extended' // tweet内容を全文取得
  }
}
