/** WisePen 主题桥接：启动时读取 URL，运行中只接收宿主窗口的主题消息。 */
(function()
{
	var params = new URLSearchParams(window.location.search);
	var schemes = ['aqua', 'mist', 'floral', 'sunset', 'emerald', 'lavender'];
	var tokens = [
		'--accent', '--accent-foreground', '--accent-text', '--accent-text-strong',
		'--accent-soft', '--accent-soft-foreground', '--accent-soft-hover', '--accent-selected',
		'--accent-border', '--accent-hover', '--background', '--foreground', '--muted',
		'--surface', '--surface-foreground', '--surface-secondary', '--surface-tertiary',
		'--surface-hover', '--overlay', '--overlay-foreground', '--border', '--separator',
		'--field-background', '--field-foreground', '--focus', '--selection', '--text-tertiary',
		'--scrollbar', '--scrollbar-thumb-hover', '--card-shadow', '--overlay-shadow',
		'--app-font-family', '--font-size-base', '--font-size-xs', '--radius', '--radius-sm',
		'--radius-lg', '--radius-xl', '--app-radius-popover'
	];
	var ui = null;
	var root = document.documentElement;
	var hostOrigin = params.get('wisepenOrigin');
	var theme = params.get('wisepenTheme') || params.get('wisepen-theme') ||
		(params.get('dark') == '1' ? 'dark' : 'light');
	var colorScheme = params.get('wisepenColorScheme') || params.get('wisepen-color-scheme') || 'aqua';

	var apply = function(next)
	{
		if (next.theme != 'light' && next.theme != 'dark') return;
		var scheme = next.colorScheme == 'default' ? 'mist' : next.colorScheme;
		if (schemes.indexOf(scheme) < 0) scheme = 'aqua';
		theme = next.theme;
		colorScheme = scheme;
		root.setAttribute('data-theme', theme);
		root.setAttribute('data-color-scheme', colorScheme);
		root.classList.toggle('dark', theme == 'dark');
		root.classList.toggle('light', theme == 'light');
		root.style.colorScheme = theme;

		if (next.tokens != null && typeof next.tokens == 'object')
		{
			tokens.forEach(function(token)
			{
				var value = next.tokens[token];
				if (typeof value == 'string' && value.trim() != '')
				{
					root.style.setProperty(token, value);
				}
				else
				{
					root.style.removeProperty(token);
				}
			});
		}

		if (ui != null && Editor.isDarkMode() != (theme == 'dark'))
		{
			// 使用 DrawIO 原生切换刷新图标与画布，不重新加载或写入文档模型。
			ui.setDarkMode(theme == 'dark');
		}
	};

	apply({theme: theme == 'dark' ? 'dark' : 'light', colorScheme: colorScheme});

	window.WisePenTheme = {
		attach: function(editorUi)
		{
			ui = editorUi;
			if (hostOrigin != null)
			{
				// 原生自动模式还会读取 DrawIO 本地设置，不能让它覆盖宿主选择的明暗。
				ui.isAutoDarkMode = function() { return false; };
			}
			apply({theme: theme, colorScheme: colorScheme});
		}
	};

	window.addEventListener('message', function(event)
	{
		if (window.parent == window || event.source !== window.parent ||
			hostOrigin == null || event.origin !== hostOrigin) return;
		var message;
		try
		{
			message = typeof event.data == 'string' ? JSON.parse(event.data) : event.data;
		}
		catch (e)
		{
			return;
		}
		if (message != null && message.action == 'wisepenTheme') apply(message);
	});
})();
