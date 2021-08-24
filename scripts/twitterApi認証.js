/*
 * twitterAPI認証用
 * CCI TECH BLOG より
 * https://tech-cci.io/archives/4228
 */

// 認証用URL取得
function getOAuthURL() {
  Logger.log(getService().authorize());
}
 
// サービス取得
function getService() {
  return OAuth1.createService('Twitter')
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      // 設定した認証情報をセット
      .setConsumerKey(PropertiesService.getScriptProperties().getProperty("CONSUMER_API_KEY"))
      .setConsumerSecret(PropertiesService.getScriptProperties().getProperty("CONSUMER_API_SECRET"))
      .setCallbackFunction('authCallback')
      // 認証情報をプロパティストアにセット（これにより認証解除するまで再認証が不要になる）
      .setPropertyStore(PropertiesService.getUserProperties());
}
 
//  認証成功時に呼び出される処理を定義
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('success!!');
  } else {
    return HtmlService.createHtmlOutput('failed');
  }    
}