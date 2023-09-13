# AdLad Dummy Plugin

This plugin allows you to easily test your AdLad implementation in your games.
While developing and testing your game, you don't want too much third party code running on your page.
These tend to clutter your console and make unnecessary network requests.

You may choose to disable all AdLad plugins during development, but this means you won't be able to easily test ad implementations.

This dummy plugin can be used during development to show short (1.5s) ads when an AdLad call is made.
Additionaly, you can configure the plugin to return specific results for AdLad calls.

## Usage

It's recommended to only bundle this plugin in development builds and set it as default plugin. Check the [main AdLad repository](https://github.com/Pelican-Party/AdLad?tab=readme-ov-file#tree-shaking-unused-plugins) for instructions on how to tree shake this plugin in production builds.

## Configuring

If the dummy plugin is the currently active plugin, you can open the browser console and type `configureAdLad()`.
Once you hit enter, a new tab will open up with settings for the plugin.
