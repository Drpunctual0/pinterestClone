window.onload = function() {
    var dots = document.querySelectorAll('.slideshow .dots .dot');
    var slides = document.querySelectorAll('.slideshow .slide');
    var resimler = document.querySelector('.resimler');
    var images = document.querySelectorAll('.resimler img');
    var scrollButton = document.querySelector('.inner-div');
    var currentIndex = 0;

    var colors = ['rgb(194, 139, 0)', 'rgb(97, 140, 123)', 'rgb(0, 118, 211)', 'rgb(64, 122, 87)'];

    function showSlide(index) {
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove('active');
            slides[i].classList.remove('active');
            dots[i].style.backgroundColor = "#ccc";
            slides[i].style.display = "none";
        }

        dots[index].classList.add('active');
        slides[index].classList.add('active');
        slides[index].style.display = "block";

        dots[index].style.backgroundColor = colors[index];
        scrollButton.style.backgroundColor = colors[index];
        
        // Burada resimlerin animasyonunu yeniden başlatıyoruz
        resimler.style.animation = 'none';
        resimler.offsetHeight; 
        resimler.style.animation = null; 

        // img'lerin animasyonunu yeniden başlatma
        images.forEach((img) => {
            img.style.animation = 'none';
            img.offsetHeight; 
            img.style.animation = null; 
        });
    }

    // Dotlara tıklama işlemi
    for (let i = 0; i < dots.length; i++) {
        dots[i].onclick = function() {
            showSlide(i);
            currentIndex = i; // Güncel slaytın dizinini saklama
        }
    }

    showSlide(currentIndex);

    setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }, 5000);
}
