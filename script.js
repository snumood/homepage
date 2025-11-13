document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar a');

    // 햄버거 버튼 클릭 시
    navToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // 모바일에서 메뉴 항목 클릭 시 메뉴 닫기
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar.classList.contains('active')) {
                navbar.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });
});
