//画面の縦横比
        var gameWidth = 640;
        var gameHeight = 480;

        //ゲーム背景の設定
        var canvas = document.getElementById('back');
        canvas.width = gameWidth;
        canvas.height = gameHeight;
        //コンテキストの取得
        var ctx = canvas.getContext('2d');
        //ビデオ要素の追加
        var back = document.getElementById('bg');
        //ビデオの読み込み
        back.autoPlay = true;
        back.loop = true;
        back.muted = true;//chrome、videoミュートにしてないと自動再生されないぽい

       
        //地面の描画設定
        var canvasW = document.getElementById('way');
        canvasW.width = gameWidth;
        canvasW.height = gameHeight;
        //コンテキストの取得
        var ctxW = canvasW.getContext('2d');
        //道路画像インスタンス生成
        var way = new Object();
        way.img = new Image();
        //道路画像のパス
        way.img.src = 'img/way.png';
        way.width = 640;
        way.height = 60;
        way.x = 0;
        way.y = 420;

        //アイテム用キャンバスの設定
        var canvasItem = document.getElementById('item');
        canvasItem.width = gameWidth;
        canvasItem.height = gameHeight;
        //コンテキストを取得
        var ctxItem = canvasItem.getContext('2d');
        //アイテムインスタンス
        var startSignal = new Object();// スタート位置を示すアイテムのインスタンス
        var endSignal = new Object();//ゴール位置を示すアイテムのインスタンス
        var item1 = new Object();//横切るとゲットできるアイテムのインスタンス
        var item2 = new Object();//ジャンプするとゲットできるアイテムのインスタンス
        var item3 = new Object();//しゃがむとゲットできるアイテムのインスタンス
        //アイテムの情報　どの、どの位置の、画像は、すでにイベントが起こったか
        //アイテム画像
        //※画像プロパティにImageインスタンスを入れるのを忘れない
        //type error Cannot set property 'src' of undefinedになる
        startSignal.img = new Image();
        endSignal.img = new Image();
        item1.img = new Image();
        item2.img = new Image();
        item3.img = new Image();
        //インスタンスを入れてからパスを渡す
        startSignal.img.src = "img/start.png";
        endSignal.img.src = "img/goal.png";
        item1.img.src = "img/item1.png";
        item2.img.src = "img/item2.png";
        item3.img.src = "img/item3.png";
        //アイテム位置
        startSignal.x = 0;
        endSignal.x = 3200;
        item1.x = 1800;
        item2.x = 2500;
        item3.x = 3000;     
        item1.y = 360;
        item2.y = 260;
        item3.y = 380;   
        //get判定
        item1.flag = false;
        item2.flag = false;
        item3.flag = false;
        //アイテムリストの配列
        var itemList = [item1, item2, item3];

        
        //キャラクターの生成
        var canvasP =document.getElementById('player'); 
        canvasP.width = gameWidth;
        canvasP.height = gameHeight;
        var ctxP = canvasP.getContext('2d');
        var player = new Object();
        player.img = new Image();
        //歩行グラフィックのパスリストの二次元配列を作成する
        var walkL = [
            "img/walk/left2.png",
            "img/walk/left1.png",
            "img/walk/left2.png",
            "img/walk/left3.png"
        ];
        var walkU = [
            "img/walk/up2.png",
             "img/walk/up1.png",
              "img/walk/up2.png",
              "img/walk/up3.png"
              ];
        var walkR = [
            "img/walk/right2.png",
            "img/walk/right1.png",
            "img/walk/right2.png",
            "img/walk/right3.png"
        ];
        var walkD = [
            "img/walk/right2.png",
            "img/walk/down1.png",
            "img/walk/down2.png",
            "img/walk/down3.png"
        ] ;
        //二次元配列、キー順
        var walkImage = [
            walkL, walkU, walkR, walkD
        ]

        //プレイヤーの初期表示位置を設定
        player.x = 50;//プレイヤーの画面上位置
        player.y = 360;//プレイヤーの画面上位置(高さ)
        player.walk = 0;//入力されたら増える、移動したら減る
        player.distance = player.x;//プレイヤーの全体マップでの位置を示す
        player.div = 2;//プレイヤーの向きを格納するプロパティ,初期は→(2) 
        player.anime = 0;//プレイヤーのアニメーション番号を格納するプロパティ 
        var anmCount = 0;//アニメーションがそのままだと早すぎるので「溜め」を作る

        //インフォメーションレイヤーの設定
        var infoCanvas = document.getElementById('info');
        infoCanvas.width = gameWidth;
        infoCanvas.height = gameHeight;
        //コンテキストの取得
        var ctxInfo = infoCanvas.getContext('2d');
        //infoのcanvasを半透明の黒で塗りつぶしてちょっと暗くする
        ctxInfo.fillStyle = 'rgba(10, 0, 20, 0.7)';
            //□を描画
            ctxInfo.fillRect(5, 5, (gameWidth - 10), (gameHeight - 10));

        //キーボードインスタンス
        var key = new Object();
        key.up = false;
        key.down = false;
        key.right = false;
        key.left = false;
        key.push = '';

        //歩行音用カウント
        var stepSound = false;

        //クリア処理を一回にする
        var goingToTop = false;

        //ゲーム処理メソッド
        function game(){
            //画面全体をクリア
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctxP.clearRect(0, 0, canvasP.width, canvasP.height);
            ctxItem.clearRect(0,0,canvasItem.width,canvasItem.height);
            ctxInfo.clearRect(0,0,canvasItem.width, canvasItem.height);
            //キャラ画像の取得
            player.img.src = walkImage[player.div][player.anime];
            //キャラの表示
            ctxP.drawImage(player.img, player.x, player.y);
            //アイテムの描画
            //スタートとゴールの表示
            ctxItem.drawImage(startSignal.img,(startSignal.x - player.distance),0);//start
            ctxItem.drawImage(endSignal.img, ( endSignal.x - player.distance + 540 ) ,0);//goal
            //未回収のアイテムを表示
            for(let i = 0; i < itemList.length; i++){
                if(itemList[i].flag == false){
            ctxItem.drawImage(itemList[i].img,(itemList[i].x - player.distance), itemList[i].y);
            }//if
            }//for


            //操作方法の表示
            if(player.distance < 641){
                ctxInfo.fillStyle = 'rgba(0, 0, 70, 0.7)';
                //□を描画
                ctxInfo.fillRect(140, 5, (gameWidth - 260), (gameHeight - 150));

                ctxInfo.font = "bold 70px serif";
                ctxInfo.fillStyle = 'rgb(255,30,0)';
                ctxInfo.textBaseline = 'middle';
                ctxInfo.fillText('　　跳',150,40,640);
                ctxInfo.fillText('　　↑',150,100,640);
                ctxInfo.fillText('戻←　→進',150,160,640);
                ctxInfo.fillText('　　↓',150,220,640);
                ctxInfo.fillText('　　崩',150,290,640);
            }
            else{
                //しばらく進むとワイプして画面外に
                ctxInfo.fillStyle = 'rgba(0, 0, 70, 0.7)';
                //□を描画
                ctxInfo.fillRect((140 + 640 - player.distance), 5, (gameWidth - 260), (gameHeight - 150));

                ctxInfo.font = "bold 70px serif";
                ctxInfo.fillStyle = 'rgb(255,30,0)';
                ctxInfo.textBaseline = 'middle';
                ctxInfo.fillText('　　跳',(150 + 640 - player.distance),40,640);
                ctxInfo.fillText('　　↑',(150 + 640 - player.distance),100,640);
                ctxInfo.fillText('戻←　→進',(150 + 640 - player.distance),160,640);
                ctxInfo.fillText('　　↓',(150 + 640 - player.distance),220,640);
                ctxInfo.fillText('　　崩',(150 + 640 - player.distance),290,640);
            }
            
            //回収したアイテムをインフォメーションレイヤーにちっちゃく表示
            if(item1.flag == true){
                ctxInfo.fillStyle = 'rgba(180, 90, 0, 0.7)';
                //□を描画
                ctxInfo.fillRect(445, 5, 200, 60);
            }
            for(let i = 0; i< itemList.length; i++){
                if(itemList[i].flag == true){
                    ctxInfo.drawImage(itemList[i].img, 0, 0, 100, 100, (450 + i * 60), 10, 50, 50);
                }
            }

            //道路の表示
            ctxW.drawImage(way.img, 0, 0, gameWidth, 120, way.x, way.y, way.width, way.height);
            //背景の表示
            ctx.drawImage(back, 0, 0);
            
            //キー入力からの操作
            //キーが押されている間keydownfunc()を呼び出す
            addEventListener("keydown", keydownfunc,false);
            //キーが離れたらkeyupfunc()を呼び出す
            addEventListener("keyup",keyupfunc,false);

            //キーが離れているとき歩行アニメを0フレーム目に戻す
            addEventListener("keyup",toZeroFlame,false);      
            //一瞬押した時に効いてないっぽい？対策は？
            
            //上記のメソッドによりキーが押されているかを判定し、押されている間以下の処理を行う
            if(key.left === true){
                //downの画像を反転したものにする
                walkD[0] = "img/walk/left2.png";
                walkD[1] = "img/walk/down1rev.png";
                walkD[2] = "img/walk/down2rev.png";
                walkD[3] = "img/walk/down3rev.png";
                
                //実質距離を左に戻す
                player.distance -= 2;
                if(player.distance < 0){
                    player.distance = 0;
                }
                //歩行値を追加
                player.walk = 15;
                //これはキーが離れた時用の操作
                key.push = 'left';
            }
            if(key.up === true){
                //downの画像を元に戻す
                walkD[0] = "img/walk/right2.png";
                walkD[1] = "img/walk/down1.png";
                walkD[2] = "img/walk/down2.png";
                walkD[3] = "img/walk/down3.png";
                //歩行値を追加
                player.walk = 15;
                key.push = 'up';
            }
            if(key.right === true){
                //downの画像を元に戻す
                walkD[0] = "img/walk/right2.png";
                walkD[1] = "img/walk/down1.png";
                walkD[2] = "img/walk/down2.png";
                walkD[3] = "img/walk/down3.png";
                //実質距離を→に進める
                player.distance += 2;
                if(player.distance > endSignal.x ){
                    player.distance = endSignal.x;
                }
                //歩行値を追加
                player.walk = 15;
                key.push = 'right';
            }
            if(key.down === true){
                //歩行値を追加
                player.walk = 15;
                key.push = 'down';
            }
            //歩行値が0より大きいなら歩行アニメ
            if(player.walk > 0){
                               
                player.walk -= 5;
                switch(key.push){
                    case 'left':
                    
                    //画面からはみ出さないために条件付けで移動させる
                    if(player.distance < 161 ){
                            //マップの端なら
                        if(player.x > 0){
                         //次回描画時のキャラ表示位置を左に
                         player.x -= 5;
                        }
                        else{
                        player.x = 0;
                         }
                           
                    }
                    else if(player.x > 270 ){                        
                            player.x -= 5;                        
                    }
                    else{
                            player.x = 270;
                        }
                   
                    //ここからアニメーション処理
                    //キャラの方向を左に
                    player.div = 0;
                    //anmCountが一定溜まっていたら(様子見て調整)画像を変えるための処理
                    if(anmCount == 10){
                        //アニメーション番号を次に進める(３だったら0に戻す)
                    player.anime += 1;
                    if(player.anime == 4){
                        player.anime = 0;
                    }//if
                    //歩行音が二回に一回鳴る
                    if(stepSound == true){
                        //音を鳴らす
                        var footStep = new Audio();
                        footStep.src = 'sound/footstep.ogg';
                        footStep.play();
                        //スイッチをoffに
                        stepSound = false;
                    }
                    else{
                        stepSound = true;
                    }//歩行音
                        //最後にカウントを元に戻す
                        anmCount = 0;
                    }
                    else{
                        anmCount += 1;
                    }
                    
                    break;
                    case 'up':
                    //ジャンプアニメーション
                    //キャラの方向をジャンプ用に                    
                    player.div = 1;
                    if(anmCount == 10){
                        //アニメーション番号を次に進める(３だったら0に戻す)
                    player.anime += 1;
                    if(player.anime == 4){
                        player.anime = 0;
                    }
                    //3flameの時はy座標を高く
                    if(player.anime == 3){
                        player.y = 330;
                        //このときにジャンプ音
                        var jumpSound = new Audio();
                        jumpSound.src = 'sound/jump.ogg';
                        jumpSound.play();
                        //さらにジャンプしたらとれるアイテムの判定
                        if(item2.flag == false){
                            //未回収なら
                            if(player.distance >= (item2.x - 320) && player.distance <= (item2.x + 100 - 320)){
                                item2.flag = true;
                                //鈴の音
                                var bell = new Audio();
                                bell.src = 'sound/small-bell01-bykuragekoushou.ogg';
                                bell.play();
                            }
                        }
                    }
                    else{
                        player.y = 360;
                    }
                    //最後にカウントを元に戻す
                        anmCount = 0;
                    }
                    else{
                        anmCount += 1;
                    }
                    
                    break;
                    case 'right':
                    //スタート・ゴール付近以外はキャラが真ん中でとどまるようにしたい
                    if( player.distance > (endSignal.x - 110)){
                            //マップの端なら
                        if(player.x < 540 ){                        
                            player.x += 5;                        
                         }
                         else{
                            player.x = 540;
                         }
                    }
                    else if(player.x < 270 ){                        
                            player.x += 5;                        
                    }
                    else{
                            player.x = 270;
                        }
                    
                    
                    //アニメーション
                    //方向を右に
                    player.div = 2;
                    if(anmCount == 10){
                        //アニメーション番号を次に進める(３だったら0に戻す)
                    player.anime += 1;
                    if(player.anime == 4){
                        player.anime = 0;
                    }
                    //歩行音が二回に一回鳴る
                    if(stepSound == true){
                        //音を鳴らす
                        var footStep = new Audio();
                        footStep.src = 'sound/footstep.ogg';
                        footStep.play();
                        //スイッチをoffに
                        stepSound = false;
                    }
                    else{
                        stepSound = true;
                    }//歩行音
                        //最後にカウントを元に戻す
                        anmCount = 0;
                    }
                    else{
                        anmCount += 1;
                    }
                    
                    break;
                    case 'down':
                    //しゃがみ込む
                    //方向を下に
                    player.div = 3;
                    if(anmCount == 10){
                        //しゃがんだらキーを放すまで起きないように、3になったらアニメーション番号がそのままになるようにする
                    if(player.anime < 3){
                        player.anime += 1;        
                        //animeが膝立ち(2)のときに”ドサッ”と崩れ落ちる音入れたい 
                        if(player.anime == 2){
                            var downSound = new Audio();
                            downSound.src = 'sound/down.ogg';
                            downSound.play();
                        }               
                    }//if(player.anime)
                    else{
                        //つまりしゃがんでいるとき
                        //ここでしゃがんだら拾えるアイテムの判定
                        if(item3.flag == false){
                            //item3を拾っていなかったら
                            if(player.distance >= (item3.x - 320) && player.distance <= (item3.x + 100 - 320)){
                                item3.flag = true;
                                //鈴の音
                                var bell = new Audio();
                                bell.src = 'sound/small-bell01-bykuragekoushou.ogg';
                                bell.play();
                            }
                        }//ifdistance
                    }
                        //最後にカウントを元に戻す
                        anmCount = 0;
                    }//if(anmCount)
                    else{
                        anmCount += 1;
                    } //else          
                    break;
                }//switch
            }     //if(player.walk)  

            //普通に歩いていて拾えるアイテムを拾う
            if(item1.flag == false){
                //フラグ未回収かつアイテムの画像圏内に入ったらフラグ回収
                if(player.distance >= (item1.x + 50 - 320) && player.distance <= (item1.x + 51 - 320)){
                    item1.flag = true;
                    //鈴の音が鳴る
                    var bell = new Audio();
                    bell.src = 'sound/small-bell01-bykuragekoushou.ogg';
                    bell.play();
                }                
            }

            //もし３つのアイテムをすべて拾っていればクリア
            var itemCheck = 0;
            for(let i = 0; i < itemList.length; i++){
                if(itemList[i].flag == true){
                    itemCheck += 1;
                }//if flagcheck
            }//for
            if(itemCheck == itemList.length){
                //画像が変わる
                endSignal.img.src = "img/start.png";
                //クリアしたらindexに戻る
            if(player.distance >= endSignal.x){
                if(!goingToTop){
                    alert("戻ろう。");
                    //footerのリンクを呼び出す
                    var toTopLink = document.getElementById('top');
                    window.location.href = toTopLink.href;
                    goingToTop = true;
                }
                
            }
            }//if clearFlag            

            //game()を繰り返す
            requestAnimationFrame(game);
        }//game()

        // 没？//buttonクリックじ処理//async/awaitで実現できそう？
        // async gameStart(target){
        //     //awaitをつかってクリックされるまでは待機するようにしたい
        //     const result = await 

        //     //用済みなのでボタンを消す
        //     document.getElementById("start").remove();
        // }

        function main(){
            //クリックしてスタート的なやつ→ボタンにmain()を起動するだけのメソッドを入れておく
            
           //用済みなのでボタンを消す
            document.getElementById("start").remove();            
            document.getElementById("warn").remove();

            //クリックされたらBGMが流れ始めるBGMインスタンス
            var music = new Audio('sound/tooryannse.ogg');
            music.loop = true; //ループON
            music.play();
            //game()の呼び出し
            game();    
            
                }//main()



        //読み込みが終わったら待機画面を描画する
        addEventListener('load', noStart(), false);

        //開始前の待機画面
        function noStart(){
            // 初期描画
            //画面全体をクリア
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctxP.clearRect(0, 0, canvasP.width, canvasP.height);
            //キャラ画像の取得
            player.img.src = walkImage[player.div][player.anime];
            //キャラの表示
            ctxP.drawImage(player.img, player.x, player.y);
            //startの信号を表示
            ctxItem.drawImage(startSignal.img,(startSignal.x - player.distance),0);
            //道路の表示
            ctxW.drawImage(way.img,way.x,way.y);
            //背景の表示
            ctx.drawImage(back, 0, 0);

            requestAnimationFrame(noStart);
        }
       
        //歩行操作を書く　歩行グラフィックが1213....と動く あと正面と後ろ、反転も用意
        //各キーが押されている間呼び出されるメソッド
        function keydownfunc(event){
            var key_code = event.keyCode;
            switch(key_code){
                case 37:
                //←が押されている間は                
                key.left = true;
                //操作中は[方向キーでのページスクロール]というデフォルト操作を禁止する(switchの中に入れたのはf5更新も効かなくなったからです)
                event.preventDefault();
                break;
                case 38:
                //↑が押されている間は
                key.up = true;
                event.preventDefault();
                break;
                case 39:
                //→が押されている間は
                key.right = true;
                event.preventDefault();
                break;
                case 40:
                //↓が押されている間は
                key.down = true;
                event.preventDefault();
                break;
            }//switch
            
        }//keydownfunc()

        //キーを放した時の処理をするメソッド   
        function keyupfunc(event){
            
            var key_code = event.keyCode;
            switch(key_code){
                case 37:
                key.left = false;
                break;
                case 38:
                player.img.src = walkImage[1][0];
                key.up = false;
                break;
                case 39:
                player.img.src = walkImage[2][0];
                key.right = false;
                break;
                case 40:
                player.img.src = walkImage[3][0];
                key.down = false;
                break;
            }//switch
        }

        function toZeroFlame(event){
            //キーが離れた時の処理
            var key_code = event.keyCode;
            if(key.left == false && key.up == false){
                if(key.right == false && key.down == false){
            //どの方向キーも押されていなければアニメーション番号を0に戻す
            //時々戻らない？ 特に↑方向の時　素早く押して放した時
            player.anime = 0;
            //これはジャンプ対策
            player.y = 360;
                }
            }
        }

        //-->
        