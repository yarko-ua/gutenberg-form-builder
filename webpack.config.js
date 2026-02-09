const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");

console.log({ defaultConfig });

module.exports = {
	...defaultConfig,
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve.alias,
			"@mixins": path.resolve(__dirname, "./src/scss/mixins"),
		},
	},
};
