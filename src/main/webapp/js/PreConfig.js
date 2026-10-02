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

// 明暗由宿主决定，覆盖 DrawIO 本地保存的独立外观设置。
urlParams['dark'] = document.documentElement.getAttribute('data-theme') == 'dark' ? '1' : '0';
if (urlParams['wisepenOrigin'] != null)
{
	window.DRAWIO_CONFIG.hideMenuItems = window.DRAWIO_CONFIG.hideMenuItems.concat([
		'appearance', 'theme', 'lightMode', 'darkMode', 'autoMode'
	]);
}
