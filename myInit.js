
var Model = {} ;
    Model.clock = null ;
	Model.books = [] ;
  Model.bookIndex = 0 ;
  Model.fileIndex = 0 ;
  Model.bookIsOpen = false ;
  Model.videoIsPlaying = false ;
	Model.prevBook = function(){
      if(UI.bookFace.length < Model.books.length){
         UI.log($('book'),'书没下载完，等会儿！') ;
        setTimeout(function(){
          UI.log($('book'),'计算思维系列课程@masterLijh') ; 
        },2000);
        
        return ;
      }
      if(Model.bookIsOpen){
        UI.log($('book'),'本书没关闭，没法向前找另一本！') ;
        return ;
      }
     if(Model.bookIndex > 0){
				Model.bookIndex -- ;
			}else{
				Model.bookIndex = Model.books.length -1
			}
      UI.log($('book'), Model.books[Model.bookIndex].name);
		 };
     
		Model.nextBook = function (){
      if(UI.bookFace.length < Model.books.length){
        UI.log($('book'),'书没下载完，等会儿！') ;
        setTimeout(function(){
          UI.log($('book'),'计算思维系列课程@masterLijh') ; 
        },2000);
        return ;
      }
      if(Model.bookIsOpen){
        UI.log($('book'),'本书还没关闭，不能看下一本！') ;
        return ;
      }
			if(Model.bookIndex < Model.books.length -1 ){
				Model.bookIndex ++ ;
			}else{
				Model.bookIndex = 0;
			}
      UI.log($('book'), Model.books[Model.bookIndex].name);
		 };

var UI = {} ;
    UI.bookFace = [] ;
    UI.log = function(ele, str){
        ele.textContent = str ;
    } ;


var Plan = {} ;
    Plan.responsiveUI = function(){
    UI.deviceWidth = window.innerWidth >= 600 ? 600 :  window.innerWidth ; 
    UI.deviceHeight = window.innerHeight ;
    UI.fontBase = parseInt(UI.deviceWidth / 21);
   
   document.body.style.width = UI.deviceWidth + "px" ;
   document.body.style.height = UI.deviceHeight + "px" ;
   document.body.style.fontSize = UI.fontBase + "px" ;
 
     $("book").style.lineHeight = UI.deviceHeight * 0.15 + 'px' ;
     $("nav").style.lineHeight = UI.deviceHeight * 0.05 + 'px' ;
     $("statusInfo").style.lineHeight = UI.deviceHeight * 0.1 + 'px' ;
   //为将书封面的完美按比例设置在客户设备的main区域，需要计算图片的纵横比
    
  } //Plan.responsiveUI


  
 //imgArr为图片路径构成的数组，而所有书的封面图片的地址，源于json文本数据文件
 /*
   Plan.loadImgOneByOne的以前版本的Bug描述：
   当用户在系统未读完全部图片前，快速滑动进行书切换，会造成UI.bookFace重复读入的问题！
   本版 Plan.loadImgOneByOne 函数做了重要修改，解决了用户恶意操作带来的UI.bookFace与Model.books不一致的问题！
 */
  Plan.loadImgOneByOne = function(imgArr){
     let img = new Image();
      img.id = 'bookFace' ;
     let index = UI.bookFace.length ;
      img.src =  imgArr[index] ;
      
        img.addEventListener('load', function(){ 
          UI.bookFace.push(this) ;
         if ( UI.bookFace.length < imgArr.length  ){  
             Plan.loadImgOneByOne(imgArr);
          }
          let s = imgArr[index].slice(0,imgArr[index].length - 4) ;
          UI.log($('statusInfo'), '《 '+ s + ' 》'+ ' has been loaded !')
          } );  //img.addEventListener('load'。。。
       }//Plan.loadImgOneByOne
 //本版新增功能，为nav栏设置三个读书功能按钮
 /*
   <nav>
    <button id ="handleBook"> 打开本书 </button>
    <button id ="downloadBook"> 下载本书 </button>
    <button id ="aboutBook"> 关于本书 </button>
   </nav>
 */
  Plan.addBookButtons = function(){
   let dadDom =  $('nav') ;
       dadDom.textContent = '' ;
   let ids = ["handleBook","downloadBook","aboutBook"] ;
   let contents = ["打开本书","下载本书","关于本书"] ;
       for(let i=0 ;i < ids.length ; i++){
         let button = document.createElement('button');
         button.id = ids[i] ;
         button.textContent = contents[i];
         dadDom.appendChild(button);
       }
  };
         
//httpLoader模型读入文本文件后，把文本处理为数组。
var httpLoader = { 
       textContent: [] , 
      _textContent: '' ,
       request: function(url, interval){
               this._request(url) ;
               typeof interval == "number" ? interval  : interval = 2 ;
                setTimeout(function(){  
                 let txt = httpLoader._textContent ;
                 if(txt.length > 1 ){
                  httpLoader.textContent = txt.split("\n"); 
                 }else{
                  console.log( "首次发起http请求的文件失败，请查查原因！") ;
                  setTimeout(httpLoader.request(url),interval*1000) ;
                  console.log("延时 " + interval + " s, 再次发起http请求");
                 }
              },interval*1000); //设定重新发起http请求
      } , // end of request
          _request: function( url ){
			         this._textContent = '' ; 
                let xhr = new XMLHttpRequest() ;
			          xhr.onreadystatechange = callback ; //注意：XMLHttpRequest的实例不支持 addEventListener方法
                xhr.open('GET', url, true); //true 设定为异步请求，false为同步请求
                xhr.send('');
    
				function callback(){ 
					        if (this.readyState === 1 ){
                    console.log("Request begin...");
                   return ;
                   } 
                  if (this.readyState === 2 ){
                    console.log("loading...");
                    return ;
                  } 
                  if (this.readyState === 3 ){
                    console.log("Http interact... ");
                    return ;
                  } 
                if (this.readyState === 4 ){
                    console.log("Request  is complete .");
                   if (xhr.status !== 200){
                      console.log("HttpServer refused ! ");
                      return ;
                   }else{
                       httpLoader._textContent = this.responseText; 
                   } // success of 
                }//readyState === 4
       }//end of callback	     
      },//end _request method
	 } ; //End httpLoader 

 //这是一个毫秒计时器模型，该模型可以同时并行记录多个事件的发生经历的时间，开发者可以用字符串（msg）作为时钟的唯一标识，进行操作。原理简述如下：当timer.begin(msg)运行开启计时，timer.clock记录一个时钟对象，而timer.end(msg)用于结束该标识的计时，返回毫秒级别的时间差，同时把相应的时钟对象删除。
//注意：当错误地使用timer计时器时，比如end方法的msg写错，后台会抛出（throw）参数错误这类严重的警告，当发生此类错误时，作为开发者必须查看调用timer.begin和timer.end代码的msg，此时的timer不能正常来测算同步代码的时间。而不会影星timer检测异步代码的执行时间！
var timer = { 
     history : [] ,
     stamps : [] ,
     begin : function(msg){
              let beginTime = new Date() - 0 ;
              let beginLable = msg ;
              this.stamps.push( {beginLable , beginTime } ) ;
              this.history.push('begin:' + msg);
            }, // end of timer.begin
     end :  function(msg){
              this.history.push('end:'+ msg)
              let endTime = new Date() - 0 ;
              let stamps = this.stamps ;
              let bak = null ;
             for (let i=0 ; i < stamps.length ; i++ ){ 
    //通过开始标签找到的开始计时的时间戳对象，下面设计一个简单的交换算法，完成计时后，再将其从timer.stamps数组中删除。
               if ( stamps[i].beginLable === msg ){
                   bak = stamps[i] ;
                   stamps[i] = stamps[stamps.length - 1] ;
                   stamps.pop();
                }
               }
               this.stamps = stamps ;
               if(bak){
                 return endTime - bak.beginTime ;
               }else{
                 throw("你错误地使用了timer.end方法，请查看参数："+ msg ); 
               }
            }//end of timer.end
      } ;//end of timer

 
     function $(ele){
        if (typeof ele !== 'string'){
           throw("自定义的$函数参数的数据类型错误，实参必须是字符串！");
           return 
        } 
        let dom = document.getElementById(ele) ;
          if(dom){
            return dom ;
          }else{
            dom = document.querySelector(ele) ;
            if (dom) {
                return dom ;
            }else{
                throw("执行$函数未能在页面上获取任何元素，请自查问题！");
                return ;
            }
          }
       } //end of $