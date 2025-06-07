
// qoreCSS npm module entry point
module.exports = {
  // Path to the main stylesheet
  coreCss: require.resolve('./core.css'),
  
  // Path to variables stylesheet for customization
  variablesCss: require.resolve('./variables.css'),
  
  // Helper function to get the stylesheet path
  getStylesheet: function() {
    return require.resolve('./core.css');
  },
  
  // Helper function to get variables path
  getVariables: function() {
    return require.resolve('./variables.css');
  }
};

// For CommonJS require() usage
if (typeof window === 'undefined') {
  // Server-side: provide path information
  module.exports.serverSide = true;
} else {
  // Client-side: auto-inject styles if in browser environment
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = require.resolve('./core.css');
  document.head.appendChild(link);
}
