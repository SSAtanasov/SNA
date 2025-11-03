(function() {
  // ⚠️ ЗАМЕНИ С ТВОЯ URL ОТ СТЪПКА 3.4!
  const SCRIPT_URL = 'https://script.google.com/macros/s/ТВОЯ_SCRIPT_ID/exec';
  
  // Не логвай от localhost или preview
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('Analytics disabled on localhost');
    return;
  }
  
  // Функция за събиране на данни
  async function logVisit() {
    try {
      // Вземи IP адрес от безплатен API
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      // Събери всички данни
      const data = {
        ip: ipData.ip,
        ua: navigator.userAgent,
        page: window.location.pathname,
        ref: document.referrer || 'direct',
        country: 'Unknown', // Може да добавиш GeoIP API ако искаш
        screen: screen.width + 'x' + screen.height,
        lang: navigator.language || navigator.userLanguage
      };
      
      // Изпрати данните към Google Sheets
      const params = new URLSearchParams(data);
      const url = SCRIPT_URL + '?' + params.toString();
      
      // Използвай Image beacon за да работи дори ако потребителя напусне страницата
      const img = new Image();
      img.src = url;
      
      console.log('Analytics logged:', data);
      
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
  
  // Изчакай страницата да се зареди напълно
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', logVisit);
  } else {
    logVisit();
  }
  
})();
