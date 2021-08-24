/** 汎用オブジェクト */
function misch(name, webhook, sheetId, sheetName, rows, checkRow) {
  this.name = name;
  this.webhook = webhook;
  this.sheetId = sheetId;
  this.sheetName = sheetName;
  this.rows = rows;
  this.checkRow = checkRow;
}

/** twitter用 */
function twitterMisch(name, webhook, sheetId, sheetName, rows, checkRow) {
  this.name = name;
  this.webhook = webhook;
  this.sheetId = sheetId;
  this.sheetName = sheetName;
  this.rows = rows;
  this.checkRow = checkRow;
  this.reply = false; // falseで外アカウントへのリプライを除外処理する
}
