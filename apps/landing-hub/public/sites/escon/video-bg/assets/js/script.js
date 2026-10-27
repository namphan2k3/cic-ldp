$(document).ready(function() {
	"use strict";

// ------------- Pre-loader--------------

// makes sure the whole site is loaded
$(window).load(function() {
    // will first fade out the loading animation
    $(".preloader").fadeOut();
    //then background color will fade out slowly
    $("#faceoff").delay(200).fadeOut("slow");
});
  
// ------------- Owl Carousel--------------

$("#screenshot-slider").owlCarousel({
    navigation : false,
    slideSpeed : 300,
    pagination: false,
    autoPlay: 5000,
    items : 3,
  });

//-------Appearence of navigation----------

  $('header .nav').onePageNav({
    scrollThreshold: 0.2, // Adjust if Navigation highlights too early or too late
    scrollOffset: 45 //Height of Navigation Bar
  });
  
  
  $(window).scroll(function() {
	  
	//if (winWidth > 767) {
	  var $scrollHeight = $(window).scrollTop();
	  if ($scrollHeight > 600) {
		$('#header').slideDown(400);
	  } else{
		$('#header').slideUp(400);
	  }
	//}
	
	 //header version 2
	
	  var $scrollHeight2 = $(window).scrollTop();
	  if ($scrollHeight2 > 120) {
		$('#header2 nav').addClass('addbg').slideDown(400);
	  } else {
		$('#header2 nav').removeClass('addbg');
	  }
	  
	  //got o top
	  if ($(this).scrollTop() > 200) {
			$('#go-to-top a').fadeIn('slow');
		  } else {
			$('#go-to-top a').fadeOut('slow');
	  }  
  });
  
 //-------scroll to top---------
  
 $('#go-to-top a').click(function(){
	$("html,body").animate({ scrollTop: 0 }, 750);
	return false;
  });
  
  
  //----------- Scroll to Next Section ---------- 
  
  $('.next-arrow a').click(function() {
    $('html,body').animate({scrollTop:$('#more_feature').offset().top - 90}, 750);
  });

//--------------- For navigation--------------------

	$('.navbar-collapse ul li a').click(function() {
		$('.navbar-toggle:visible').click();
	});

//--------------- SmoothSroll--------------------
var scrollAnimationTime = 1200,
    scrollAnimation = 'easeInOutExpo';
$('a.scrollto').bind('click.smoothscroll', function (event) {
    event.preventDefault();
    var target = this.hash;
    $('html, body').stop().animate({
        'scrollTop': $(target).offset().top
    }, scrollAnimationTime, scrollAnimation, function () {
        window.location.hash = target;
    });
});

// Animate and WOW Animation
    var wow = new WOW(
        {
            //offset: 50,
            mobile: false
           // live: true
        }
    );
    wow.init();
	
// ------------- Magnific Image Popup--------------

    $('.screenshot-popup').magnificPopup({
      type:'image',
      closeBtnInside:true,
      // Delay in milliseconds before popup is removed
      removalDelay: 300,

      // Class that is added to popup wrapper and background
      // make it unique to apply your CSS animations just to this exact popup
      mainClass: 'mfp-fade',
      gallery: {
          enabled: true, // set to true to enable gallery

          preload: [0,2], // read about this option in next Lazy-loading section

          navigateByImgClick: true,

          //arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>', // markup of an arrow button

          closeMarkup: '<button title="%title%" class="mfp-close"><i class="mfp-close-icn">&times;</i></button>',

          tPrev: 'Previous (Left arrow key)', // title for left button
          tNext: 'Next (Right arrow key)', // title for right button
          //tCounter: '<span class="mfp-counter">%curr% of %total%</span>' // markup of counter
        }
   });

// ------------- Magnific Video Popup--------------
   
 	$('.play').magnificPopup({
	  disableOn: 700,
	  type: 'iframe',
	  mainClass: 'mfp-fade',
	  removalDelay: 160,
	  preloader: false,
	  fixedContentPos: false
	});
	
// ------------- FAQs Icon--------------	
	var $active = $('#accordion .panel-collapse.in').prev().addClass('active');
	$active.find('a').append('<span class="glyphicon glyphicon-minus pull-right"></span>');
	$('#accordion .panel-heading').not($active).find('a').prepend('<span class="glyphicon glyphicon-plus pull-right"></span>');
	$('#accordion').on('show.bs.collapse', function (e)
	{
		$('#accordion .panel-heading.active').removeClass('active').find('.glyphicon').toggleClass('glyphicon-plus glyphicon-minus');
		$(e.target).prev().addClass('active').find('.glyphicon').toggleClass('glyphicon-plus glyphicon-minus');
	});
	$('#accordion').on('hide.bs.collapse', function (e)
	{
		$(e.target).prev().removeClass('active').find('.glyphicon').removeClass('glyphicon-minus').addClass('glyphicon-plus');
	});
	
	
//-----------Text Slider on Banner-----------

   $('.flex_text').flexslider({
        animation: "slide",
		selector: ".slides li",
		controlNav: false,
		directionNav: false,
		slideshowSpeed: 4000,
		touch: true,
		useCSS: false,
		direction: "vertical",
        before: function(slider){        
		 var height = $('.flex_text').find('.flex-viewport').innerHeight();
		 $('.flex_text').find('li').css({ height: height + 'px' });
        }		
    });

 

// --------------video background------------------

  var videobackground = new $.backgroundVideo($('body'), {
        "align": "centerXY",
        "width": 1280,
        "height": 720,
        "path": "media/",
        "filename": "cloud",
        "types": ["mp4","ogg","webm"]
      });

 // --------------Newsletter-----------------------

	$(".newsletter-signup").ajaxChimp({
		callback: mailchimpResponse,
		url: "http://codepassenger.us10.list-manage.com/subscribe/post?u=6b2e008d85f125cf2eb2b40e9&id=6083876991" // Replace your mailchimp post url inside double quote "".  
	});

	function mailchimpResponse(resp) {
		 if(resp.result === 'success') {
		 
			$('.newsletter-success').html(resp.msg).fadeIn().delay(3000).fadeOut();
			
		} else if(resp.result === 'error') {
			$('.newsletter-error').html(resp.msg).fadeIn().delay(3000).fadeOut();
		}  
	};
	
  // --------------Contact Form Ajax request-----------------------

    $('.contact_form').on('submit', function(event){
    event.preventDefault();

    // $this = $(this);

    var data = {
      name: $('#name').val(),
      phone: $('#phone').val(),
      email: $('#contact_email').val(),
      // subject: $('#subject').val(),
      message: $('#message').val()
    };

    $.ajax({
      type: "POST",
      url: "email.php",
      data: data,
      success: function(msg){
	     $('.contact-success').fadeIn().delay(3000).fadeOut();
      }
    });
  });

 /* =================================
===  IE10 ON WINDOWS 8 FIX      ====
=================================== */
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
  var msViewportStyle = document.createElement('style')
  msViewportStyle.appendChild(
    document.createTextNode(
      '@-ms-viewport{width:auto!important}'
    )
  )
  document.querySelector('head').appendChild(msViewportStyle)
}

});