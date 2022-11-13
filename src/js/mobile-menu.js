function mobileMenu() {
  var navBarNav = document.getElementById("navBarNav");
  var mobileMenu = document.getElementById("mobileMenu");
  if (navBarNav.classList.contains('navbr__nav_show')) {
    navBarNav.classList.remove('navbr__nav_show');
    mobileMenu.classList.remove('icon_cross');
  }
  else {
    navBarNav.classList.toggle("navbr__nav_show");
    mobileMenu.classList.toggle('icon_cross');
  }
}