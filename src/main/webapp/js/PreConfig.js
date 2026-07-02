/**
 * Copyright (c) 2006-2024, JGraph Holdings Ltd
 * Copyright (c) 2006-2024, draw.io AG
 */
// Overrides of global vars need to be pre-loaded
window.DRAWIO_PUBLIC_BUILD = true;
window.EXPORT_URL = 'REPLACE_WITH_YOUR_IMAGE_SERVER';
window.PLANT_URL = 'REPLACE_WITH_YOUR_PLANTUML_SERVER';
window.DRAWIO_BASE_URL = null; // Replace with path to base of deployment, e.g. https://www.example.com/folder
window.DRAWIO_VIEWER_URL = null; // Replace your path to the viewer js, e.g. https://www.example.com/js/viewer.min.js
window.DRAWIO_LIGHTBOX_URL = null; // Replace with your lightbox URL, eg. https://www.example.com
window.DRAW_MATH_URL = 'math4/es5';
window.DRAWIO_CONFIG = window.DRAWIO_CONFIG || {}; // Replace with your custom draw.io configurations. For more details, https://www.drawio.com/doc/faq/configure-diagram-editor
urlParams['sync'] = 'manual';
urlParams['pages'] = '0';
urlParams['hide-pages'] = '1';
urlParams['page'] = '0';

(function()
{
	var mergeUnique = function(base, values)
	{
		var result = Array.isArray(base) ? base.slice() : [];
		var lookup = {};
		var i;

		for (i = 0; i < result.length; i++)
		{
			lookup[result[i]] = true;
		}

		for (i = 0; i < values.length; i++)
		{
			if (!lookup[values[i]])
			{
				result.push(values[i]);
				lookup[values[i]] = true;
			}
		}

		return result;
	};

	// WisePen 只承载单页图，隐藏 DrawIO 的帮助菜单和多页图入口。
	window.DRAWIO_CONFIG.hideMenus = mergeUnique(window.DRAWIO_CONFIG.hideMenus, ['help']);
	window.DRAWIO_CONFIG.hideMenuItems = mergeUnique(window.DRAWIO_CONFIG.hideMenuItems, [
		'help',
		'about',
		'support',
		'keyboardShortcuts',
		'quickStart',
		'downloadDesktop',
		'pages',
		'pageTabs',
		'insertPage',
		'removePage',
		'renamePage',
		'duplicatePage',
		'movePage',
		'previousPage',
		'nextPage'
	]);
})();

(function()
{
	// WisePenView 通过 iframe URL 传入主题，DrawIO 独立运行时使用默认浅色主题。
	var theme = urlParams['wisepenTheme'] || urlParams['wisepen-theme'] || 'light';
	var colorScheme = urlParams['wisepenColorScheme'] || urlParams['wisepen-color-scheme'] || 'default';
	var allowedThemes = {'light': true, 'dark': true};
	var allowedColorSchemes = {
		'default': true,
		'warm': true,
		'academic': true,
		'violet': true,
		'forest': true,
		'minimal': true
	};

	if (!allowedThemes[theme])
	{
		theme = 'light';
	}

	if (!allowedColorSchemes[colorScheme])
	{
		colorScheme = 'default';
	}

	document.documentElement.setAttribute('data-theme', theme);
	document.documentElement.setAttribute('data-color-scheme', colorScheme);
	document.documentElement.classList.toggle('dark', theme == 'dark');

	if (theme == 'dark' && urlParams['dark'] == null)
	{
		urlParams['dark'] = '1';
	}
})();
