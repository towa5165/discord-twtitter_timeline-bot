/** 普通に取得 */
function trigger_example() {
  var example = new twitterMisch(TWITTER_EXAMPLE, WEBHOOK_EXAMPLE, SHEET_TWEET_ID, SHEET_EXAMPLE_NAME, 1, 'A');
  tweetCheck(example, twitterDefaultQuery(example.name));
}

/** リプライ先も送信する */
function trigger_example_withReply() {
  var withReply = new twitterMisch(TWITTER_EXAMPLE, WEBHOOK_EXAMPLE, SHEET_TWEET_ID, SHEET_EXAMPLE_NAME, 1, 'A');
  withReply.reply = true; // ここをfalse以外にするとリプライ先も送信します
  tweetCheck(withReply, twitterDefaultQuery(withReply.name));
}
