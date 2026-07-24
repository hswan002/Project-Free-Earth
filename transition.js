document.addEventListener('DOMContentLoaded', function () {
  document.body.classList.add('page-loaded');

  var tabs = Array.from(document.querySelectorAll('[data-tab-target]'));
  if (tabs.length) {
    tabs.forEach(function (tabButton) {
      tabButton.addEventListener('click', function () {
        var targetId = tabButton.getAttribute('data-tab-target');
        if (!targetId) {
          return;
        }

        var tabContainer = tabButton.closest('.research-tab-shell');
        if (!tabContainer) {
          return;
        }

        var siblingTabs = Array.from(tabContainer.querySelectorAll('[data-tab-target]'));
        var panels = Array.from(tabContainer.querySelectorAll('.mini-panel'));

        siblingTabs.forEach(function (button) {
          button.classList.remove('is-active');
          button.setAttribute('aria-selected', 'false');
        });

        panels.forEach(function (panel) {
          panel.classList.remove('is-active');
          panel.setAttribute('hidden', 'hidden');
        });

        tabButton.classList.add('is-active');
        tabButton.setAttribute('aria-selected', 'true');

        var targetPanel = tabContainer.querySelector('#' + targetId);
        if (targetPanel) {
          targetPanel.classList.add('is-active');
          targetPanel.removeAttribute('hidden');
        }
      });
    });
  }

  var links = Array.from(document.querySelectorAll('a[href]'));
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
      return;
    }

    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (link.hasAttribute('download') || href.startsWith('javascript:') || href.startsWith('http://') || href.startsWith('https://')) {
        return;
      }

      event.preventDefault();
      if (document.body.classList.contains('page-exiting')) {
        return;
      }
      document.body.classList.add('page-exiting');
      window.setTimeout(function () {
        window.location.href = href;
      }, 320);
    });
  });
});
