 var lastY;
    setTimeout(function() {

      $(function() {
        var box = $(".main-wrapper");
        // var $window = $(window); //Window object     
        var scrollTime = 1.2; //Scroll time
        var scrollDistance = 170; //Distance. Use smaller value for shorter scroll and greater value for longer scroll
        box.on("touchstart", function(event) {
          event.preventDefault();
          lastY = event.touches[0].pageY;
        });
        box.on("touchmove", function(event) {
          // console.log("event==>", event);
          // var currentY = event.originalEvent.touches[0].clientY;
          var currentY = event.touches[0].pageY;
          event.preventDefault();
          // var delta = event.originalEvent.wheelDelta / 120 || -event.originalEvent.detail / 3;
          var delta = (currentY - lastY ) / 10 || -event.originalEvent.detail / 3;
          var scrollTop = box.scrollTop();
          var finalScroll = scrollTop - parseInt(delta * scrollDistance);
          // console.log('delta===> ', delta);
          lastY = currentY;
          TweenMax.to(box, scrollTime, {
            scrollTo: { y: finalScroll, autoKill: true },
            ease: Power1.easeOut, //For more easing functions see https://api.greensock.com/js/com/greensock/easing/package-detail.html
            autoKill: true,
            overwrite: 5
          });
        });
      });
    }, 0);