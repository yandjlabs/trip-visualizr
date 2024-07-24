const copyright = document.getElementById('copyright');
const year = new Date().getFullYear();

copyright.innerHTML = `Copyright © ${year}&nbsp;<a class="copyright-link" href="https://github.com/yandjlabs" target="_blank"> Y&JLabs</a>`;