(function () {
  "use strict";

  const slider = new Swiper(".mySwiper", {
    pagination: {
      el: ".swiper-pagination",
    },
  });

  function heroSlider() {
    if (document.querySelector('.hero-slider')) {
      const swiper = new Swiper('.hero-slider .swiper', {
        loop: true,
        // pagination: {
        //   el: ".swiper-pagination",
        //   clickable: true
        // },
        navigation: {
          nextEl: '.hero-slider .slider-button-next',
          prevEl: '.hero-slider .slider-button-prev',
        },
      })
    }
  }

  // Önce Sonra Slider
  function onceSonraSlider() {
    if (document.querySelector('.once-sonra-slider')) {
      const slider = new Swiper('.once-sonra-slider .swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        navigation: {
          nextEl: ".once-sonra-slider .slider-button-outline-next",
          prevEl: ".once-sonra-slider .slider-button-outline-prev",
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
          },
          992: {
            slidesPerView: 3,
          },
        }
      })
    }

  }

  // Intl Tel Input

  function telefonInput() {
    const input = document.querySelector("#phone");
    window.intlTelInput(input, {
      // allowDropdown: false,
      // autoPlaceholder: "off",
      // containerClass: "test",
      // countryOrder: ["jp", "kr"],
      // customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
      //   return "e.g. " + selectedCountryPlaceholder;
      // },
      // dropdownContainer: document.querySelector('#custom-container'),
      // excludeCountries: ["us"],
      // fixDropdownWidth: false,
      // formatAsYouType: false,
      // formatOnDisplay: false,
      // geoIpLookup: function(callback) {
      //   fetch("https://ipapi.co/json")
      //     .then(function(res) { return res.json(); })
      //     .then(function(data) { callback(data.country_code); })
      //     .catch(function() { callback(); });
      // },
      // hiddenInput: () => "phone_full",
      // i18n: { 'de': 'Deutschland' },
      initialCountry: "us",
      // nationalMode: false,
      // onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
      // placeholderNumberType: "MOBILE",
      // showFlags: false,
      // separateDialCode: true,
      // strictMode: true,
      // useFullscreenPopup: true,
      utilsScript: "./utils.js",
    });
  }

  // Scroll top Button

  function scrollTop() {
    const btnScrollTop = document.getElementById('scrollTop')
    document.addEventListener('scroll', () => {
      if (window.scrollY > 1000) {
        btnScrollTop.classList.remove('hide-btn');
      } else {
        btnScrollTop.classList.add('hide-btn');
      }
    })

    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    })
  }

  // heroSlider()
  // telefonInput()
  // onceSonraSlider()
  // videoSlider()
  // videoSayfaSlider()
  // deneyimSlider()
  // initAcc('.accordion.v1', true);
  // uygulamalarSlider()
  // scrollTop()


})();