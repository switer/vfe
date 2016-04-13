'use strict'

// Check if this is a windows runtime or not
var WIN = /^win/.test(process.platform);

module.exports = {
	// Captures component id (e.g 'feedback_form' from 'feedback/feedback_form').
	COMPONENT_ID_PATH: WIN ? /([^\\\.]+)$/ : /([^\/\.]+)$/,
	// Captures enclosing dir
	// (e.g '_fixtures/dir_with_file_and_component' from
	// '_fixtures/dir_with_file_and_component/component')
	ENCLOSING_DIR_PATH: WIN ? /.+\\.+$/ : /.*\/.+$/,

	COMPONENT_ID: WIN ? /^([^\\\.]+)$/ : /^([^\/\.]+)$/,
	ENCLOSING_DIR: WIN ? /^([^\\\.]+)\\([^\\\.]+)$/ : /^(.+)\/([^\/\.])+$/,

	IGNORED: /^\$ignored::/,
	ABSOLUTE_PATH: /^[\/\\]([\w\_\$\-]+)\b/,
}