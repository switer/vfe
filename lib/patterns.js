'use strict'

// Check if this is a windows runtime or not
var WIN = /^win/.test(process.platform);

module.exports = {
	// Captures component id (e.g 'feedback_form' from 'feedback/feedback_form').
	COMPONENT_ID_PATH: /[\\\/]([^\\\/\.]+)$/,
	COMPONENT_ID: /^([^\/\\\.]+)$/,
	// (e.g '_fixtures/dir_with_file_and_component' from
	// '_fixtures/dir_with_file_and_component/component')
	ENCLOSING_DIR_PATH: /([^\/\\\.]+)[\\\/]([^\/\\\.]+)$/,
	ENCLOSING_DIR: /^([^\/\\\.]+)[\\\/]([^\/\\\.]+)$/,
	IGNORED: /^\$ignored::/,
	ABSOLUTE_PATH: /^[\/\\]([\w\_\$\-]+)\b/,
	HOME_PATH: /^\~[\/\\]/
}