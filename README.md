# discord-twtitter_timeline-bot
Google Apps Script用のTwitterの特定ユーザーのつぶやきを取得してDiscordウェブフックに投げるbot

IFTTT等で満足できなくなったので作成。  
ただdiscordに転送するだけでなく、APIで取得したTwitterオブジェクトを解析し埋め込み(Embeds)を作成したりしてDiscordウェブフックに投げるのが特徴的な機能です。

Google Apps Script(以下GAS)とスプレッドシートを使用していわゆる"サーバーレス"で利用できます。  
またIFTTTのトライアルだと3つまでですがTwitterAPIのリクエスト許容量が許す限りbotを増やせます。


## 機能
GASでTwitter API(Stantard v1.1)を通して特定ユーザーの最新のつぶやきを取得  
スプレッドシートをデータベース代わりにし転送済みチェックを行い、未転送のものがあればDiscordウェブフックへと転送します。  
転送の際にEmbedsを作成したり追加でURLを送信したりします。  
転送したtweetのIDをスプレッドシートに保存し次回の比較に使用します。

#### リプライ先のテキストをEmbedsのフィールドに表示する
<details><summary>リプライツリー投稿の埋め込み</summary><div>
  
  フィールドタイトルはリプライ同様`@スクリーンネーム`で表示します。
  
  ![リプライツリー投稿](https://github.com/towa5165/discord-twtitter_timeline-bot/blob/img/reply.png)
</div></details>

#### 引用元もEmbedsのフィールドに表示する
<details><summary>引用の埋め込み</summary><div>
  
  フィールドタイトルはユーザー名を取得し表示します。
  
  ![引用](https://raw.githubusercontent.com/towa5165/discord-twtitter_timeline-bot/img/quote.png)
</div></details>

#### tweetに添付された画像をデフォルト生成されるEmbedsと同様に表示する

#### GIF動画が添付されている場合、直接的なURLを取り出して続けて送信する
<details><summary>GIFの直リン</summary><div>
  
  Embedsでは動画等は埋め込めませんがURL先が動画であればDiscordクライアントがプレビューしてくれます  
  ブラウザに切り替えなくてもDiscordのままGIF動画をチェックできます。  
  GIF以外の動画は未対応です。
  
  ![GIF直リン](https://raw.githubusercontent.com/towa5165/discord-twtitter_timeline-bot/img/gif.png)
</div></details>


#### YouTubeへのリンクがある場合、リンクを続けて送信する
<details><summary>YouTubeへのリンク</summary><div>
  
  YouTubeへのリンクを送信すると専用の埋め込みが作成されます  
  こちらもDiscord側で視聴できるようになります。
  
  ![YouTubeリンク](https://raw.githubusercontent.com/towa5165/discord-twtitter_timeline-bot/img/youtube.png)
</div></details>


## 使い方
用意するもの
- GASプロジェクト
- 空のスプレッドシート
- Twitter開発者アカウント

1. GASプロジェクトの作成  
作成してください

2. GASライブラリの登録  
以下のライブラリを登録してください  
TwitterWebService `1rgo8rXsxi1DxI_5Xgo_t3irTw1Y5cxl2mGSkbozKsSXf2E_KBBPC3xTF`  
OAuth1 `1CXDCY5sqT9ph64fFwSzVtXnbjpSfWdRymafDrtIZ7Z_hwysTY7IIhi7s`

3. スクリプトのコピペ  
自分のGASプロジェクトにコピペしてください。

4. TwitterAPI認証  
TwitterDeveloperPortalでアプリを作成し、`TwitterApi認証.js`を利用してAPIを認証してください。  
権限はRead Onlyで大丈夫です。  
TwitterDeveloperPortal周りはここでは解説しません。

5. 定数の入力、実行用変数の作成  
スプレッドシートのIDや使用するシートの名前、取得したいアカウントのスクリーンネームやdiscordのウェブフックURLを登録してください。  
`trigger_example()`のようにオブジェクトを作成し`tweetCheck()`を実行する変数を作成してください。

6. トリガー作成  
5で作成した変数を実行するトリガーを作成してください。  
以上です。時間間隔はお好みでどうぞ


## 他細かい仕様
- 該当tweetへの短縮URLを除去  
apiで取得したテキスト中にはなぜか該当tweetへの短縮URLが埋め込まれます。埋め込まれていないこともあります。  
URLは全て短縮URLで取得するため非常に紛らわしいです。  
Twitterオブジェクト中にユーザーが入力したurlが格納される場所(推定)があるのでそこと比較し、入力外のURLを除去しています。

- discordウェブフックへの送信時にエラーが起きたIDをシートに記録しない  
稀にdiscordウェブフック側がタイムアウトして受け取れないことがあります。そういったtweetのIDをシートに保存するリストから除去しています。  

- Embedsの色やフッター  
色は指定せずフッターはタイムスタンプのみいれてます。  
自由に変更してください。

- リクエストのカスタマイズ  
`twitterDefaultQuery()`をいじればTwitterAPIのリクエストの変更が可能です。  
コードを見ていただければわかりますが、オブジェクトのキーを取得してリクエストパラメータを作成しています。  
必要に応じて適宜追加したり変更してください。  
ただし`tweet_mode : 'extended'`は**変更しないでください。**  
変更した場合、URLの処理周りでエラーが発生します。(URLが途中で切れてリダイレクト先チェックが上手く動かない等)

- 定数MAX_NUM  
リクエストで要求する数やシートの使用範囲に使用しています。  
取得したい対象のアカウントのつぶやきが多すぎて拾いきれないときはトリガーの実行間隔を早めるかこの数字を増やしてください。

## 現状把握している問題点
- たまに通信エラーになる  
対応は諦めてます。  
discordウェブフック側も稀に発生しますし短縮URLリダイレクト先チェックでも発生します。  
> Exception: 使用できないアドレス: https～～
